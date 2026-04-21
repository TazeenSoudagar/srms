<?php

namespace App\Http\Controllers\Api;

use App\Events\ScheduleCreated;
use App\Events\ScheduleUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceScheduleRequest;
use App\Http\Requests\UpdateServiceScheduleRequest;
use App\Http\Resources\ServiceScheduleResource;
use App\Models\ServiceSchedule;
use App\Notifications\ScheduleCreated as ScheduleCreatedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ServiceScheduleController extends Controller
{
    /**
     * Display a listing of schedules.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ServiceSchedule::with(['serviceRequest.service', 'customer', 'engineer']);

        // Filter based on user role
        if ($user->role->name === 'Client') {
            $query->forCustomer($user->id);
        } elseif ($user->role->name === 'Support Engineer') {
            $query->forEngineer($user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        }

        if ($request->has('upcoming') && $request->upcoming) {
            $query->upcoming();
        }

        $schedules = $query->orderBy('scheduled_at', 'asc')->paginate(20);

        return response()->json([
            'data' => ServiceScheduleResource::collection($schedules->items()),
            'meta' => [
                'current_page' => $schedules->currentPage(),
                'last_page' => $schedules->lastPage(),
                'per_page' => $schedules->perPage(),
                'total' => $schedules->total(),
            ],
        ]);
    }

    /**
     * Store a newly created schedule.
     */
    public function store(StoreServiceScheduleRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Set customer_id from authenticated user
        $validated['customer_id'] = $request->user()->id;

        // Auto-calculate GST amounts server-side
        if (isset($validated['actual_price'])) {
            $gstRate = 18.00;
            $gstAmount = round((float) $validated['actual_price'] * ($gstRate / 100), 2);
            $validated['gst_rate'] = $gstRate;
            $validated['gst_amount'] = $gstAmount;
            $validated['total_amount'] = round((float) $validated['actual_price'] + $gstAmount, 2);
        }

        $schedule = ServiceSchedule::create($validated);
        $schedule->load(['serviceRequest.service', 'customer', 'engineer']);

        // Broadcast the event
        broadcast(new ScheduleCreated($schedule))->toOthers();

        // Send database notification to the customer
        $schedule->customer?->notify(new ScheduleCreatedNotification($schedule));

        return response()->json([
            'message' => 'Schedule created successfully',
            'data' => new ServiceScheduleResource($schedule),
        ], 201);
    }

    /**
     * Display the specified schedule.
     */
    public function show(Request $request, string $hashedId): JsonResponse
    {
        $id = \Vinkla\Hashids\Facades\Hashids::decode($hashedId)[0] ?? null;

        if (! $id) {
            return response()->json(['message' => 'Invalid schedule ID'], 404);
        }

        $schedule = ServiceSchedule::with(['serviceRequest.service', 'customer', 'engineer'])
            ->findOrFail($id);

        Gate::authorize('view', $schedule);

        return response()->json([
            'data' => new ServiceScheduleResource($schedule),
        ]);
    }

    /**
     * Update the specified schedule.
     */
    public function update(UpdateServiceScheduleRequest $request, string $hashedId): JsonResponse
    {
        $id = \Vinkla\Hashids\Facades\Hashids::decode($hashedId)[0] ?? null;

        if (! $id) {
            return response()->json(['message' => 'Invalid schedule ID'], 404);
        }

        $schedule = ServiceSchedule::findOrFail($id);

        Gate::authorize('update', $schedule);

        $validated = $request->validated();

        // Auto-calculate GST amounts server-side
        if (isset($validated['actual_price'])) {
            $gstRate = 18.00;
            $gstAmount = round((float) $validated['actual_price'] * ($gstRate / 100), 2);
            $validated['gst_rate'] = $gstRate;
            $validated['gst_amount'] = $gstAmount;
            $validated['total_amount'] = round((float) $validated['actual_price'] + $gstAmount, 2);
        }

        $schedule->update($validated);
        $schedule->load(['serviceRequest.service', 'customer', 'engineer']);

        // Broadcast the event
        broadcast(new ScheduleUpdated($schedule))->toOthers();

        return response()->json([
            'message' => 'Schedule updated successfully',
            'data' => new ServiceScheduleResource($schedule),
        ]);
    }

    /**
     * Cancel the specified schedule.
     */
    public function cancel(Request $request, string $hashedId): JsonResponse
    {
        $id = \Vinkla\Hashids\Facades\Hashids::decode($hashedId)[0] ?? null;

        if (! $id) {
            return response()->json(['message' => 'Invalid schedule ID'], 404);
        }

        $schedule = ServiceSchedule::findOrFail($id);

        Gate::authorize('cancel', $schedule);

        if (! $schedule->isCancellable()) {
            return response()->json([
                'message' => 'This schedule cannot be cancelled',
            ], 422);
        }

        $schedule->update([
            'status' => 'cancelled',
        ]);

        $schedule->load(['serviceRequest.service', 'customer', 'engineer']);

        // Broadcast the event
        broadcast(new ScheduleUpdated($schedule))->toOthers();

        return response()->json([
            'message' => 'Schedule cancelled successfully',
            'data' => new ServiceScheduleResource($schedule),
        ]);
    }

    /**
     * Complete the specified schedule.
     */
    public function complete(Request $request, string $hashedId): JsonResponse
    {
        $id = \Vinkla\Hashids\Facades\Hashids::decode($hashedId)[0] ?? null;

        if (! $id) {
            return response()->json(['message' => 'Invalid schedule ID'], 404);
        }

        $schedule = ServiceSchedule::findOrFail($id);

        Gate::authorize('complete', $schedule);

        $request->validate([
            'actual_price' => 'nullable|numeric|min:0|max:999999.99',
        ]);

        $updateData = [
            'status' => 'completed',
            'completed_at' => now(),
        ];

        $actualPrice = $request->input('actual_price') ?? $schedule->actual_price;

        if ($actualPrice !== null) {
            $gstRate = 18.00;
            $gstAmount = round((float) $actualPrice * ($gstRate / 100), 2);
            $updateData['actual_price'] = (float) $actualPrice;
            $updateData['gst_rate'] = $gstRate;
            $updateData['gst_amount'] = $gstAmount;
            $updateData['total_amount'] = round((float) $actualPrice + $gstAmount, 2);
        }

        $schedule->update($updateData);

        $schedule->load(['serviceRequest.service', 'customer', 'engineer']);

        // Broadcast the event
        broadcast(new ScheduleUpdated($schedule))->toOthers();

        return response()->json([
            'message' => 'Schedule completed successfully',
            'data' => new ServiceScheduleResource($schedule),
        ]);
    }

    /**
     * Get available time slots for scheduling.
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'engineer_id' => 'nullable|exists:users,id',
            'date' => 'required|date',
        ]);

        $date = $request->date;
        $engineerId = $request->engineer_id;

        // Get existing schedules for the date
        $existingSchedules = ServiceSchedule::whereDate('scheduled_at', $date)
            ->when($engineerId, fn ($q) => $q->forEngineer($engineerId))
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->get(['scheduled_at', 'estimated_duration_minutes']);

        // Generate available slots (9 AM to 5 PM, 1-hour intervals)
        $slots = [];
        $startHour = 9;
        $endHour = 17;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            $slotTime = \Carbon\Carbon::parse($date)->setTime($hour, 0);

            // Check if slot is available
            $isAvailable = ! $existingSchedules->contains(function ($schedule) use ($slotTime) {
                $scheduleStart = $schedule->scheduled_at;
                $scheduleEnd = $scheduleStart->copy()->addMinutes($schedule->estimated_duration_minutes ?? 60);

                // Slot is unavailable if it starts within an existing schedule's time range
                return $slotTime->greaterThanOrEqualTo($scheduleStart) && $slotTime->lessThan($scheduleEnd);
            });

            $slots[] = [
                'time' => $slotTime->format('Y-m-d H:i:s'),
                'display' => $slotTime->format('h:i A'),
                'available' => $isAvailable,
            ];
        }

        return response()->json([
            'date' => $date,
            'slots' => $slots,
        ]);
    }
}
