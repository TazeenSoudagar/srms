<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('send-otp', [AuthController::class, 'sendOtp'])
        ->middleware('throttle:5,1'); // 5 requests per minute

    Route::post('verify-otp', [AuthController::class, 'verifyOtp'])
        ->middleware('throttle:10,1'); // 10 requests per minute
});
