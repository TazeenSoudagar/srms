<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest\AssignServiceRequestRequest;
use App\Http\Requests\ServiceRequest\StoreServiceRequestRequest;
use App\Http\Requests\ServiceRequest\UpdateServiceRequestRequest;
use App\Http\Requests\ServiceRequest\UpdateStatusRequest;
use App\Http\Resources\ServiceRequest\ServiceRequestCollection;
use App\Http\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AdminNewServiceRequest;
use App\Services\ActivityLogService;
use App\Services\HashidsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class ServiceRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): ServiceRequestCollection
    {
        $this->authorize('viewAny', ServiceRequest::class);

        $user = Auth::user();
        $query = ServiceRequest::with(['service', 'createdBy', 'updatedBy', 'schedules.engineer'])
            ->forUser($user)
            ->where('is_active', true);

        // Apply filters
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('priority')) {
            $query->byPriority($request->priority);
        }

        if ($request->has('assigned_to')) {
            $assignedTo = $request->assigned_to;

            // Decode hashed user ID if provided
            if (! is_numeric($assignedTo)) {
                $hashidsService = app(HashidsService::class);
                $decodedId = $hashidsService->decode((string) $assignedTo);
                if ($decodedId !== null) {
                    $assignedTo = $decodedId;
                }
            }

            $query->assignedTo((int) $assignedTo);
        }

        if ($request->has('created_by')) {
            $createdBy = $request->created_by;

            // Decode hashed user ID if provided
            if (! is_numeric($createdBy)) {
                $hashidsService = app(HashidsService::class);
                $decodedId = $hashidsService->decode((string) $createdBy);
                if ($decodedId !== null) {
                    $createdBy = $decodedId;
                }
            }

            $query->createdBy((int) $createdBy);
        }

        if ($request->has('service_id')) {
            $serviceId = $request->service_id;

            // Decode hashed service_id if provided
            if (! is_numeric($serviceId)) {
                $hashidsService = app(HashidsService::class);
                $decodedId = $hashidsService->decode((string) $serviceId);
                if ($decodedId !== null) {
                    $serviceId = $decodedId;
                }
            }

            $query->where('service_id', (int) $serviceId);
        }

        if ($request->has('date_from') || $request->has('date_to')) {
            $query->byDateRange($request->date_from, $request->date_to);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Sorting
        if ($request->filled('sort_by') && in_array($request->sort_by, ['created_at', 'updated_at', 'status', 'priority'], true)) {
            $sortOrder = $request->sort_order === 'asc' ? 'asc' : 'desc';
            $query->orderBy($request->sort_by, $sortOrder);
        } elseif (! $request->filled('status')) {
            // Default "All" view: open → in_progress → closed → cancelled, then newest first
            $query->orderByRaw("FIELD(status, 'open', 'in_progress', 'closed', 'cancelled')")
                  ->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min((int) ($request->per_page ?? 15), 100); // Max 100 per page
        $serviceRequests = $query->paginate($perPage);

        return new ServiceRequestCollection($serviceRequests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequestRequest $request): JsonResponse
    {
        $this->authorize('create', ServiceRequest::class);

        $user = Auth::user();
        $data = $request->validated();
        $data['request_number'] = ServiceRequest::generateRequestNumber();
        $data['created_by'] = $user->id;
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['status'] = 'open';
        $data['is_active'] = true;

        $serviceRequest = ServiceRequest::create($data);
        $serviceRequest->load(['service', 'createdBy']);

        // Log activity
        ActivityLogService::logCreated($user, $serviceRequest, [
            'title' => $serviceRequest->title,
            'service' => $serviceRequest->service->name ?? null,
        ]);

        // Notify all admins and support engineers
        $admins = User::whereHas('role', fn ($q) => $q->whereIn('name', ['Admin', 'Support Engineer']))->get();
        Notification::send($admins, new AdminNewServiceRequest($serviceRequest));

        return (new ServiceRequestResource($serviceRequest))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $this->authorize('view', $serviceRequest);

        $serviceRequest->load([
            'service',
            'createdBy',
            'updatedBy',
            'schedules.engineer',
            'schedules.invoice',
            'comments.user.role',
            'media',
        ]);

        return new ServiceRequestResource($serviceRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequestRequest $request, ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $this->authorize('update', $serviceRequest);

        $user = Auth::user();
        $oldData = $serviceRequest->toArray();
        $data = $request->validated();

        // Calculate changed fields before adding system fields
        $changedFields = array_keys(array_diff_assoc($data, array_intersect_key($oldData, $data)));

        // Add system fields after calculating changed fields
        $data['updated_by'] = $user->id;

        $serviceRequest->update($data);
        $serviceRequest->load(['service', 'createdBy', 'updatedBy']);

        // Log activity with changed fields (excluding system fields)
        ActivityLogService::logUpdated($user, $serviceRequest, [
            'changed_fields' => $changedFields,
        ]);

        return new ServiceRequestResource($serviceRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceRequest $serviceRequest): JsonResponse
    {
        $this->authorize('delete', $serviceRequest);

        $user = Auth::user();

        // Log activity before deletion
        ActivityLogService::logDeleted($user, $serviceRequest, [
            'request_number' => $serviceRequest->request_number,
        ]);

        $serviceRequest->delete();

        return response()->json([
            'message' => 'Service request deleted successfully',
        ], 200);
    }

    /**
     * Assign a service request to a support engineer.
     */
    public function assign(AssignServiceRequestRequest $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $this->authorize('assign', $serviceRequest);

        $user = Auth::user();
        $engineer = \App\Models\User::findOrFail($request->assigned_to);

        // Create a schedule instead of directly assigning
        $serviceRequest->load('service');

        $scheduleData = [
            'service_request_id' => $serviceRequest->id,
            'customer_id' => $serviceRequest->created_by,
            'engineer_id' => $engineer->id,
            'scheduled_at' => $serviceRequest->preferred_time_slot ?? now()->addDay(),
            'estimated_duration_minutes' => $serviceRequest->service?->average_duration_minutes ?? 60,
            'status' => 'pending',
        ];

        $schedule = \App\Models\ServiceSchedule::create($scheduleData);
        $schedule->load(['serviceRequest', 'customer', 'engineer']);

        broadcast(new \App\Events\ScheduleCreated($schedule))->toOthers();

        $customer = \App\Models\User::find($serviceRequest->created_by);
        $customer?->notify(new \App\Notifications\ScheduleCreated($schedule));

        $engineer->notify(new \App\Notifications\EngineerAssigned($schedule));

        // Update service request
        $serviceRequest->update([
            'status' => 'in_progress',
            'updated_by' => $user->id,
        ]);

        // Log activity
        ActivityLogService::logAssigned($user, $serviceRequest, $engineer, [
            'schedule_id' => $schedule->id,
            'scheduled_at' => $schedule->scheduled_at->toISOString(),
        ]);

        $serviceRequest->load(['service', 'createdBy', 'updatedBy']);

        return (new ServiceRequestResource($serviceRequest))
            ->additional(['schedule' => $schedule])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the status of a service request.
     */
    public function updateStatus(UpdateStatusRequest $request, ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $this->authorize('update', $serviceRequest);

        $user = Auth::user();
        $oldStatus = $serviceRequest->status?->value ?? $serviceRequest->status;
        $newStatus = $request->status;

        $updateData = [
            'status' => $newStatus,
            'updated_by' => $user->id,
        ];

        // If status is closed, set closed_at timestamp
        if ($newStatus === 'closed' && ! $serviceRequest->closed_at) {
            $updateData['closed_at'] = now();
        }

        // If reopening a closed request, clear closed_at
        if ($newStatus !== 'closed' && $serviceRequest->closed_at) {
            $updateData['closed_at'] = null;
        }

        $serviceRequest->update($updateData);
        $serviceRequest->load(['service', 'createdBy', 'updatedBy', 'schedules.engineer']);

        // Log activity
        ActivityLogService::logStatusChanged($user, $serviceRequest, $oldStatus, $newStatus);

        // Notify relevant parties of status change
        $this->notifyStatusChange($serviceRequest, $oldStatus, $newStatus, $user);

        return new ServiceRequestResource($serviceRequest);
    }

    /**
     * Close a service request.
     */
    public function close(ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $this->authorize('close', $serviceRequest);

        $user = Auth::user();
        $oldStatus = $serviceRequest->status?->value ?? $serviceRequest->status;

        $serviceRequest->update([
            'status' => 'closed',
            'closed_at' => now(),
            'updated_by' => $user->id,
        ]);

        $serviceRequest->load(['service', 'createdBy', 'updatedBy', 'schedules.engineer']);

        // Log activity
        ActivityLogService::logClosed($user, $serviceRequest, [
            'previous_status' => $oldStatus,
        ]);

        // Notify relevant parties
        $this->notifyStatusChange($serviceRequest, $oldStatus, 'closed', $user);

        return new ServiceRequestResource($serviceRequest);
    }

    private function notifyStatusChange(
        ServiceRequest $serviceRequest,
        string $oldStatus,
        string $newStatus,
        User $actor
    ): void {
        $notification = new \App\Notifications\ServiceRequestStatusChanged($serviceRequest, $oldStatus, $newStatus);

        // Notify customer (unless they triggered the change)
        $customer = User::find($serviceRequest->created_by);
        if ($customer && $customer->id !== $actor->id) {
            $customer->notify($notification);
        }

        // Notify assigned engineers (unless one of them triggered the change)
        $serviceRequest->schedules->each(function ($schedule) use ($notification, $actor) {
            if ($schedule->engineer && $schedule->engineer->id !== $actor->id) {
                $schedule->engineer->notify($notification);
            }
        });

        // Notify admins
        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
        $admins->each(function ($admin) use ($notification, $actor) {
            if ($admin->id !== $actor->id) {
                $admin->notify($notification);
            }
        });
    }

    /**
     * Cancel a service request.
     * Customers can only cancel their own requests that are still open.
     */
    public function cancel(ServiceRequest $serviceRequest): JsonResponse
    {
        $this->authorize('cancel', $serviceRequest);

        $user = Auth::user();
        $oldStatus = $serviceRequest->status?->value ?? $serviceRequest->status;

        // Validate that the request can be cancelled
        if ($oldStatus !== 'open') {
            return response()->json([
                'message' => 'Cannot cancel request. Only open requests can be cancelled.',
            ], 422);
        }

        $serviceRequest->update([
            'status' => 'cancelled',
            'closed_at' => now(),
            'updated_by' => $user->id,
        ]);

        // Cascade: cancel all pending/confirmed schedules so engineers are notified
        $serviceRequest->schedules()
            ->whereIn('status', ['pending', 'confirmed'])
            ->update(['status' => 'cancelled']);

        $serviceRequest->load(['service', 'createdBy', 'updatedBy']);

        // Log activity
        ActivityLogService::logStatusChanged($user, $serviceRequest, $oldStatus, 'cancelled');

        return response()->json([
            'message' => 'Service request cancelled successfully',
            'data' => new ServiceRequestResource($serviceRequest),
        ], 200);
    }
}
