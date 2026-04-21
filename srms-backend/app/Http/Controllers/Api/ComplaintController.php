<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Complaint\StoreComplaintRequest;
use App\Http\Requests\Complaint\UpdateComplaintRequest;
use App\Http\Resources\Complaint\ComplaintResource;
use App\Jobs\Complaint\SendComplaintResolutionOtpJob;
use App\Models\Complaint;
use App\Models\Media;
use App\Models\OtpVerification;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\ComplaintAssigned;
use App\Notifications\ComplaintClosed;
use App\Notifications\ComplaintCreated;
use App\Notifications\ComplaintOtpNotification;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ComplaintController extends Controller
{
    /**
     * List complaints scoped by role.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Complaint::class);

        $user = Auth::user();

        $complaints = Complaint::query()
            ->forUser($user)
            ->with(['serviceRequest', 'createdBy', 'assignedEngineer', 'media'])
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => ComplaintResource::collection($complaints),
            'meta' => [
                'current_page' => $complaints->currentPage(),
                'last_page' => $complaints->lastPage(),
                'per_page' => $complaints->perPage(),
                'total' => $complaints->total(),
            ],
        ]);
    }

    /**
     * Create a new complaint. Only clients can create. Images are required.
     */
    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $this->authorize('create', Complaint::class);

        $user = Auth::user();

        $serviceRequest = ServiceRequest::find($request->integer('service_request_id'));

        // Ensure the service request belongs to this customer and is closed
        if ($serviceRequest->created_by !== $user->id) {
            return response()->json(['message' => 'You can only raise complaints for your own service requests.'], 403);
        }

        if (($serviceRequest->status?->value ?? $serviceRequest->status) !== 'closed') {
            return response()->json(['message' => 'Complaints can only be raised on completed (closed) service requests.'], 422);
        }

        // Auto-fill engineer from the service request's last completed schedule
        $assignedEngineerId = $serviceRequest->schedules()
            ->whereNotNull('engineer_id')
            ->orderByDesc('scheduled_at')
            ->value('engineer_id');

        $complaint = DB::transaction(function () use ($request, $user, $serviceRequest, $assignedEngineerId) {
            $complaint = Complaint::create([
                'complaint_number' => Complaint::generateComplaintNumber(),
                'service_request_id' => $serviceRequest->id,
                'created_by' => $user->id,
                'assigned_engineer_id' => $assignedEngineerId,
                'status' => 'pending',
                'description' => $request->input('description'),
            ]);

            foreach ($request->file('images') as $image) {
                $fileName = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('complaints/' . $complaint->id, $fileName, 'public');

                Media::create([
                    'name' => $image->getClientOriginalName(),
                    'url' => Storage::url($path),
                    'path' => $path,
                    'collection' => 'complaints',
                    'mime_type' => $image->getMimeType(),
                    'mediaable_id' => $complaint->id,
                    'mediaable_type' => Complaint::class,
                ]);
            }

            return $complaint;
        });

        ActivityLogService::logCreated($user, $complaint, [
            'complaint_number' => $complaint->complaint_number,
            'service_request_id' => $serviceRequest->id,
        ]);

        // Notify all admins
        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
        $complaint->load('serviceRequest');
        Notification::send($admins, new ComplaintCreated($complaint));

        $complaint->load(['serviceRequest', 'createdBy', 'assignedEngineer', 'media']);

        return response()->json([
            'message' => 'Complaint raised successfully.',
            'data' => new ComplaintResource($complaint),
        ], 201);
    }

    /**
     * View a single complaint.
     */
    public function show(Complaint $complaint): JsonResponse
    {
        $this->authorize('view', $complaint);

        $complaint->load(['serviceRequest', 'createdBy', 'assignedEngineer', 'media']);

        return response()->json(['data' => new ComplaintResource($complaint)]);
    }

    /**
     * Admin updates status / assigns engineer.
     */
    public function update(UpdateComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $this->authorize('update', $complaint);

        $actor = Auth::user();
        $oldStatus = $complaint->status?->value ?? $complaint->status;

        $data = array_filter([
            'assigned_engineer_id' => $request->input('assigned_engineer_id'),
            'status' => $request->input('status'),
        ], fn ($v) => $v !== null);

        $complaint->update($data);
        $complaint->refresh();

        ActivityLogService::logUpdated($actor, $complaint, $data);

        // If engineer was assigned, notify them
        if ($request->has('assigned_engineer_id') && $complaint->assignedEngineer) {
            $complaint->load('assignedEngineer');
            $complaint->assignedEngineer->notify(new ComplaintAssigned($complaint));
        }

        $complaint->load(['serviceRequest', 'createdBy', 'assignedEngineer', 'media']);

        return response()->json([
            'message' => 'Complaint updated.',
            'data' => new ComplaintResource($complaint),
        ]);
    }

    /**
     * Admin closes complaint directly with a note — customer gets notified.
     */
    public function adminClose(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorize('update', $complaint);

        $request->validate([
            'admin_note' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $actor = Auth::user();

        if (($complaint->status?->value ?? $complaint->status) === 'closed') {
            return response()->json(['message' => 'Complaint is already closed.'], 422);
        }

        $complaint->update([
            'status' => 'closed',
            'admin_note' => $request->input('admin_note'),
            'closed_at' => now(),
        ]);

        ActivityLogService::logClosed($actor, $complaint, [
            'closed_by' => 'admin',
            'admin_note' => $request->input('admin_note'),
        ]);

        // Notify customer
        $customer = User::find($complaint->created_by);
        $customer?->notify(new ComplaintClosed($complaint, 'admin'));

        $complaint->load(['serviceRequest', 'createdBy', 'assignedEngineer', 'media']);

        return response()->json([
            'message' => 'Complaint closed.',
            'data' => new ComplaintResource($complaint),
        ]);
    }

    /**
     * Engineer requests OTP to resolve complaint — OTP sent to customer (mail + in-app notification).
     */
    public function requestResolution(Complaint $complaint): JsonResponse
    {
        $this->authorize('close', $complaint);

        $actor = Auth::user();

        if (($complaint->status?->value ?? $complaint->status) === 'closed') {
            return response()->json(['message' => 'Complaint is already closed.'], 422);
        }

        if (($complaint->status?->value ?? $complaint->status) === 'pending') {
            return response()->json(['message' => 'Complaint must be in progress before requesting resolution.'], 422);
        }

        $customer = User::find($complaint->created_by);
        if (! $customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $otp = $this->generateOtp();
        $expirationMinutes = config('auth.otp.expiration_minutes', 10);

        DB::transaction(function () use ($customer, $complaint, $otp, $expirationMinutes) {
            OtpVerification::where('user_id', $customer->id)
                ->where('type', 'complaint_resolution')
                ->where('is_verified', false)
                ->delete();

            OtpVerification::create([
                'otp' => $otp,
                'email' => $customer->email,
                'user_id' => $customer->id,
                'type' => 'complaint_resolution',
                'expires_at' => now()->addMinutes($expirationMinutes),
                'is_verified' => false,
            ]);

            DB::afterCommit(function () use ($customer, $otp, $complaint) {
                SendComplaintResolutionOtpJob::dispatch(
                    $customer->email,
                    $otp,
                    $complaint->complaint_number
                );
            });
        });

        // In-app notification to customer with OTP
        $customer->notify(new ComplaintOtpNotification($complaint, $otp));

        ActivityLogService::logUpdated($actor, $complaint, [
            'action' => 'requested_resolution',
            'complaint_number' => $complaint->complaint_number,
        ]);

        return response()->json([
            'message' => 'Resolution OTP sent to the customer. Please ask the customer for the OTP.',
        ]);
    }

    /**
     * Engineer verifies OTP from customer — complaint is closed.
     */
    public function verifyResolution(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorize('close', $complaint);

        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $actor = Auth::user();

        if (($complaint->status?->value ?? $complaint->status) === 'closed') {
            return response()->json(['message' => 'Complaint is already closed.'], 422);
        }

        $customer = User::find($complaint->created_by);
        if (! $customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $otpVerification = OtpVerification::where('user_id', $customer->id)
            ->where('email', $customer->email)
            ->where('otp', $request->otp)
            ->where('type', 'complaint_resolution')
            ->latest()
            ->first();

        if (! $otpVerification) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        if ($otpVerification->is_verified) {
            return response()->json(['message' => 'OTP already used.'], 422);
        }

        if ($otpVerification->isExpired()) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 422);
        }

        $otpVerification->markAsVerified();

        $complaint->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        ActivityLogService::logClosed($actor, $complaint, [
            'closed_by' => 'engineer',
            'complaint_number' => $complaint->complaint_number,
        ]);

        // Notify customer
        $customer->notify(new ComplaintClosed($complaint, 'engineer'));

        // Notify admins
        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
        Notification::send($admins, new ComplaintClosed($complaint, 'engineer'));

        $complaint->load(['serviceRequest', 'createdBy', 'assignedEngineer', 'media']);

        return response()->json([
            'message' => 'Complaint resolved and closed successfully.',
            'data' => new ComplaintResource($complaint),
        ]);
    }

    private function generateOtp(): string
    {
        $otpConfig = config('auth.otp');

        if ($otpConfig['admin_bypass_enabled']) {
            return $otpConfig['admin_otp'];
        }

        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
