<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginPasswordRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\SetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\AuthResource;
use App\Jobs\Auth\SendOtpJob;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Generate a secure 6-digit OTP
     */
    private function generateOtp(string $email): string
    {
        // Check if admin bypass is enabled
        $otpConfig = config('auth.otp');

        if ($otpConfig['admin_bypass_enabled'] && $email === $otpConfig['admin_email']) {
            return $otpConfig['admin_otp'];
        }

        // Generate cryptographically secure random OTP
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check admin bypass for testing
     */
    private function checkAdminBypass(string $email, string $otp, User $user): ?JsonResponse
    {
        $otpConfig = config('auth.otp');

        if (
            $otpConfig['admin_bypass_enabled']
            && $email === $otpConfig['admin_email']
            && $otp === $otpConfig['admin_otp']
        ) {
            Auth::login($user);
            $token = $user->createToken('auth-token')->plainTextToken;

            return new JsonResponse(new AuthResource($user->load(['role', 'avatar']), $token));
        }

        return null;
    }

    public function sendOtp(SendOtpRequest $request): JsonResponse
    {
        // User is already validated by SendOtpRequest, fetch once
        $user = User::where('email', $request->email)->firstOrFail();

        // Generate secure OTP
        $otp = $this->generateOtp($request->email);
        $expirationMinutes = config('auth.otp.expiration_minutes', 10);

        // Use transaction to ensure atomicity
        DB::transaction(function () use ($request, $user, $otp, $expirationMinutes) {
            // Find existing unverified OTP for this user and type
            $otpVerification = OtpVerification::forEmail($request->email)
                ->unverified()
                ->where('user_id', $user->id)
                ->where('type', $request->type)
                ->where('expires_at', '>', now())
                ->first();

            if ($otpVerification) {
                // Update existing unverified OTP with new values
                $otpVerification->update([
                    'otp' => $otp,
                    'expires_at' => now()->addMinutes($expirationMinutes),
                    'is_verified' => false,
                    'verified_at' => null,
                ]);
            } else {
                // Create new OTP record
                OtpVerification::create([
                    'otp' => $otp,
                    'email' => $request->email,
                    'user_id' => $user->id,
                    'type' => $request->type,
                    'expires_at' => now()->addMinutes($expirationMinutes),
                    'is_verified' => false,
                ]);
            }

            // Dispatch job after transaction commits
            DB::afterCommit(function () use ($user, $otp) {
                SendOtpJob::dispatch($user->email, $otp);
            });
        });

        return response()->json([
            'message' => 'OTP sent successfully',
        ], 200);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        // User is already validated by VerifyOtpRequest, fetch once
        $user = User::where('email', $request->email)->firstOrFail();

        // Check admin bypass first
        $adminResponse = $this->checkAdminBypass($request->email, $request->otp, $user);
        if ($adminResponse) {
            return $adminResponse;
        }

        // Find OTP for this email and OTP value
        $otpVerification = OtpVerification::forEmail($request->email)
            ->where('otp', $request->otp)
            ->when($request->has('type'), function ($query) use ($request) {
                return $query->where('type', $request->type);
            })
            ->latest()
            ->first();

        // Check if OTP exists
        if (! $otpVerification) {
            return response()->json([
                'message' => 'Invalid OTP',
            ], 422);
        }

        // Check if OTP was already verified
        if ($otpVerification->is_verified) {
            return response()->json([
                'message' => 'OTP already verified',
            ], 422);
        }

        // Check if OTP is expired
        if ($otpVerification->isExpired()) {
            return response()->json([
                'message' => 'OTP has expired',
            ], 422);
        }

        // Mark as verified and authenticate user
        if (! $otpVerification->markAsVerified()) {
            return response()->json([
                'message' => 'Failed to verify OTP. Please try again.',
            ], 500);
        }

        Auth::login($user);

        // Create Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        return new JsonResponse(new AuthResource($user->load(['role', 'avatar']), $token));
    }

    /**
     * Login with email and password
     */
    public function loginPassword(LoginPasswordRequest $request): JsonResponse
    {
        // Find user by email and check if active
        $user = User::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        // Check if user exists and password is correct
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Authenticate user
        Auth::login($user);

        // Create Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        return new JsonResponse(new AuthResource($user->load(['role', 'avatar']), $token));
    }

    /**
     * Logout the authenticated user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Register a new user (Client role) and send OTP for verification
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Get the Client role ID (role_id = 3)
        $clientRoleId = 3;

        // Check if user exists but is inactive (incomplete registration)
        $existingUser = User::where('email', $request->email)
            ->where('is_active', false)
            ->first();

        // Create or update user with Client role
        $user = DB::transaction(function () use ($request, $clientRoleId, $existingUser) {
            if ($existingUser) {
                // Update existing inactive user's information
                $existingUser->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'phone' => $request->phone,
                    'email_verified_at' => null, // Reset verification
                ]);
                $user = $existingUser;
            } else {
                // Create new user
                $user = User::create([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'role_id' => $clientRoleId,
                    'is_active' => false, // Inactive until email is verified
                ]);
            }

            // Generate and send OTP
            $otp = $this->generateOtp($request->email);
            $expirationMinutes = config('auth.otp.expiration_minutes', 10);

            // Find existing unverified OTP or create new one
            $otpVerification = OtpVerification::forEmail($request->email)
                ->unverified()
                ->where('user_id', $user->id)
                ->where('type', 'registration')
                ->first();

            if ($otpVerification) {
                // Update existing OTP
                $otpVerification->update([
                    'otp' => $otp,
                    'expires_at' => now()->addMinutes($expirationMinutes),
                ]);
            } else {
                // Create new OTP record
                OtpVerification::create([
                    'otp' => $otp,
                    'email' => $request->email,
                    'user_id' => $user->id,
                    'type' => 'registration',
                    'expires_at' => now()->addMinutes($expirationMinutes),
                    'is_verified' => false,
                ]);
            }

            // Dispatch job after transaction commits
            DB::afterCommit(function () use ($user, $otp) {
                SendOtpJob::dispatch($user->email, $otp);
            });

            return $user;
        });

        $message = $existingUser
            ? 'OTP resent successfully. Please check your email for verification.'
            : 'Registration successful. Please check your email for OTP verification.';

        return response()->json([
            'message' => $message,
            'email' => $user->email,
        ], 201);
    }

    /**
     * Verify OTP after registration
     */
    public function verifyRegistrationOtp(VerifyOtpRequest $request): JsonResponse
    {
        // User is already validated by VerifyOtpRequest
        $user = User::where('email', $request->email)->firstOrFail();

        // Check admin bypass first
        $adminResponse = $this->checkAdminBypass($request->email, $request->otp, $user);
        if ($adminResponse) {
            // Activate user if admin bypass
            $user->update(['is_active' => true]);

            return $adminResponse;
        }

        // Find OTP for registration
        $otpVerification = OtpVerification::forEmail($request->email)
            ->where('otp', $request->otp)
            ->where('type', 'registration')
            ->latest()
            ->first();

        // Check if OTP exists
        if (! $otpVerification) {
            return response()->json([
                'message' => 'Invalid OTP',
            ], 422);
        }

        // Check if OTP was already verified
        if ($otpVerification->is_verified) {
            return response()->json([
                'message' => 'OTP already verified',
            ], 422);
        }

        // Check if OTP is expired
        if ($otpVerification->isExpired()) {
            return response()->json([
                'message' => 'OTP has expired',
            ], 422);
        }

        // Mark OTP as verified
        if (! $otpVerification->markAsVerified()) {
            return response()->json([
                'message' => 'Failed to verify OTP. Please try again.',
            ], 500);
        }

        // Mark email as verified (but keep user inactive until password is set)
        $user->update(['email_verified_at' => now()]);

        return response()->json([
            'message' => 'Email verified successfully. Please set your password.',
            'email' => $user->email,
        ], 200);
    }

    /**
     * Set password after registration and OTP verification
     */
    public function setPassword(SetPasswordRequest $request): JsonResponse
    {
        // Find user by email
        $user = User::where('email', $request->email)->firstOrFail();

        // Check if user has verified their registration OTP
        $hasVerifiedOtp = OtpVerification::forEmail($request->email)
            ->where('user_id', $user->id)
            ->where('type', 'registration')
            ->where('is_verified', true)
            ->exists();

        if (! $hasVerifiedOtp) {
            return response()->json([
                'message' => 'Please verify your OTP first before setting password.',
            ], 422);
        }

        // Update password, mark email as verified, and activate account
        $user->update([
            'password' => $request->password, // Will be auto-hashed by model cast
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Auto-login user
        Auth::login($user);

        // Create Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        return new JsonResponse(new AuthResource($user->load(['role', 'avatar']), $token));
    }
}
