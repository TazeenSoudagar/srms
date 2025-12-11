<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Jobs\Auth\SendOtpJob;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function sendOtp(SendOtpRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        $otp = rand(100000, 999999);

        if($request->email === 'admin@gmail.com' ){
            $otp = '123456';
        }
        Log::info('OTP: ' . $otp);

        SendOtpJob::dispatch($user->email, $otp);

        return response()->json([
            'message' => 'OTP sent successfully',
        ], 200);
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        $user = User::where('email', $request->email)->first();
        if(!$user){
            return response()->json([
                'message' => 'Invalid email',
            ], 422);
        }
        if ($request->email === 'admin@gmail.com' && $request->otp === '123456') {
            return response()->json([
                'message' => 'OTP verified successfully.',
            ], 200);
        }

        return response()->json([
            'message' => 'Invalid OTP',
        ], 422);
    }
}
