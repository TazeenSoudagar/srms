<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\Auth\SendServiceCompletionOtpJob;
use App\Models\OtpVerification;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\ServiceRequestStatusChanged;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ServiceCompletionController extends Controller
{
    /**
     * Engineer requests service completion — sends OTP to the customer.
     */
    public function requestCompletion(ServiceRequest $serviceRequest): JsonResponse
    {
        $engineer = Auth::user();

        // Only the assigned engineer or admin can trigger completion
        $this->authorize('update', $serviceRequest);

        if (! in_array($serviceRequest->status?->value ?? $serviceRequest->status, ['open', 'in_progress'])) {
            return response()->json([
                'message' => 'Only open or in-progress service requests can be marked as completed.',
            ], 422);
        }

        $customer = User::find($serviceRequest->created_by);

        if (! $customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $otp = $this->generateOtp();
        $expirationMinutes = config('auth.otp.expiration_minutes', 10);

        DB::transaction(function () use ($customer, $serviceRequest, $otp, $expirationMinutes) {
            OtpVerification::where('user_id', $customer->id)
                ->where('type', 'service_completion')
                ->where('is_verified', false)
                ->delete();

            OtpVerification::create([
                'otp' => $otp,
                'email' => $customer->email,
                'user_id' => $customer->id,
                'type' => 'service_completion',
                'expires_at' => now()->addMinutes($expirationMinutes),
                'is_verified' => false,
            ]);

            DB::afterCommit(function () use ($customer, $otp, $serviceRequest) {
                SendServiceCompletionOtpJob::dispatch(
                    $customer->email,
                    $otp,
                    $serviceRequest->request_number
                );
            });
        });

        ActivityLogService::logUpdated(
            $engineer,
            $serviceRequest,
            ['action' => 'requested_completion', 'request_number' => $serviceRequest->request_number]
        );

        return response()->json([
            'message' => 'Completion OTP sent to the customer\'s email. Please ask the customer to verify.',
        ]);
    }

    /**
     * Customer verifies the completion OTP — status is set to closed.
     */
    public function verifyCompletion(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $customer = Auth::user();

        // Only the customer who owns the request can verify
        if ($serviceRequest->created_by !== $customer->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $otpVerification = OtpVerification::where('user_id', $customer->id)
            ->where('email', $customer->email)
            ->where('otp', $request->otp)
            ->where('type', 'service_completion')
            ->latest()
            ->first();

        if (! $otpVerification) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        if ($otpVerification->is_verified) {
            return response()->json(['message' => 'OTP already used.'], 422);
        }

        if ($otpVerification->isExpired()) {
            return response()->json(['message' => 'OTP has expired. Please ask the engineer to resend.'], 422);
        }

        $otpVerification->markAsVerified();

        $oldStatus = $serviceRequest->status?->value ?? $serviceRequest->status;

        $serviceRequest->update([
            'status' => 'closed',
            'closed_at' => now(),
            'updated_by' => $customer->id,
        ]);

        $serviceRequest->load(['service', 'createdBy', 'updatedBy', 'schedules.engineer']);

        ActivityLogService::logStatusChanged($customer, $serviceRequest, $oldStatus, 'closed');

        // Notify all relevant parties of closure
        $admins = User::whereHas('role', fn ($q) => $q->whereIn('name', ['Admin']))->get();
        Notification::send($admins, new ServiceRequestStatusChanged($serviceRequest, $oldStatus, 'closed'));

        // Notify assigned engineer
        $serviceRequest->schedules->each(function ($schedule) use ($serviceRequest, $oldStatus) {
            if ($schedule->engineer) {
                $schedule->engineer->notify(new ServiceRequestStatusChanged($serviceRequest, $oldStatus, 'closed'));
            }
        });

        return response()->json([
            'message' => 'Service completion verified. The service request is now closed.',
            'data' => new \App\Http\Resources\ServiceRequest\ServiceRequestResource($serviceRequest),
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
