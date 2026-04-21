<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\ServiceSchedule;
use App\Models\User;
use App\Notifications\PaymentProofUploaded;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * Customer uploads payment proof for a completed schedule.
     * Route: POST /api/service-requests/{serviceRequest}/payment-proof
     */
    public function uploadProof(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $customer = Auth::user();

        if ($serviceRequest->created_by !== $customer->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $schedule = $serviceRequest->schedules()
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        if (! $schedule) {
            return response()->json(['message' => 'No completed schedule found for this request.'], 422);
        }

        if ($schedule->payment_status === 'paid_verified') {
            return response()->json(['message' => 'Payment has already been verified.'], 422);
        }

        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        // Delete old proof if re-uploading
        if ($schedule->payment_proof_path) {
            Storage::disk('local')->delete($schedule->payment_proof_path);
        }

        $file = $request->file('proof');
        $path = $file->store("payment-proofs/{$schedule->id}", 'local');

        $schedule->updateQuietly([
            'payment_status'       => 'paid',
            'payment_proof_path'   => $path,
            'payment_proof_mime'   => $file->getMimeType(),
            'payment_uploaded_at'  => now(),
        ]);

        ActivityLogService::logUpdated(
            $customer,
            $serviceRequest,
            ['action' => 'payment_proof_uploaded', 'schedule_id' => $schedule->id]
        );

        // Notify all admins
        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
        Notification::send($admins, new PaymentProofUploaded($schedule, $serviceRequest));

        return response()->json([
            'message'        => 'Payment proof uploaded successfully. Admin will verify shortly.',
            'payment_status' => 'paid',
        ]);
    }

    /**
     * Admin verifies payment and marks as paid_verified.
     * Route: POST /api/service-requests/{serviceRequest}/payment-verify
     */
    public function verifyPayment(ServiceRequest $serviceRequest): JsonResponse
    {
        $admin = Auth::user();

        if (strtolower($admin->role?->name ?? '') !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $schedule = $serviceRequest->schedules()
            ->where('payment_status', 'paid')
            ->latest('payment_uploaded_at')
            ->first();

        if (! $schedule) {
            return response()->json(['message' => 'No payment proof found to verify.'], 422);
        }

        $schedule->updateQuietly([
            'payment_status'      => 'paid_verified',
            'payment_verified_at' => now(),
        ]);

        ActivityLogService::logUpdated(
            $admin,
            $serviceRequest,
            ['action' => 'payment_verified', 'schedule_id' => $schedule->id]
        );

        return response()->json([
            'message'        => 'Payment verified successfully.',
            'payment_status' => 'paid_verified',
        ]);
    }

    /**
     * Serve the payment proof file (admin or the customer who owns the request).
     * Route: GET /api/service-requests/{serviceRequest}/payment-proof
     */
    public function downloadProof(ServiceRequest $serviceRequest): mixed
    {
        $user = Auth::user();
        $roleName = strtolower($user->role?->name ?? '');

        $isOwner = $serviceRequest->created_by === $user->id;
        $isAdmin = $roleName === 'admin';

        if (! $isOwner && ! $isAdmin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $schedule = $serviceRequest->schedules()
            ->whereNotNull('payment_proof_path')
            ->latest('payment_uploaded_at')
            ->first();

        if (! $schedule || ! $schedule->payment_proof_path) {
            return response()->json(['message' => 'No payment proof found.'], 404);
        }

        if (! Storage::disk('local')->exists($schedule->payment_proof_path)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        return Storage::disk('local')->download(
            $schedule->payment_proof_path,
            'payment-proof-' . $serviceRequest->request_number . '.' . pathinfo($schedule->payment_proof_path, PATHINFO_EXTENSION)
        );
    }
}
