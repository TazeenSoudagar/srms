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

Route::middleware('auth:sanctum')->group(function () {
    // Profile routes (for authenticated user)
    Route::prefix('profile')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
        Route::put('/', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::post('/change-password', [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        Route::post('/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'deleteAvatar']);
    });

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // Services
    Route::apiResource('services', \App\Http\Controllers\Api\ServiceController::class);

    // Service Requests
    Route::apiResource('service-requests', \App\Http\Controllers\Api\ServiceRequestController::class);
    Route::post('service-requests/{serviceRequest}/assign', [\App\Http\Controllers\Api\ServiceRequestController::class, 'assign']);
    Route::patch('service-requests/{serviceRequest}/status', [\App\Http\Controllers\Api\ServiceRequestController::class, 'updateStatus']);
    Route::post('service-requests/{serviceRequest}/close', [\App\Http\Controllers\Api\ServiceRequestController::class, 'close']);

    // Comments (nested under service requests)
    Route::get('service-requests/{serviceRequest}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::post('service-requests/{serviceRequest}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);
    Route::get('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'show']);
    Route::put('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'update']);
    Route::delete('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'destroy']);

    // Media/Attachments (nested under service requests)
    Route::post('service-requests/{serviceRequest}/media', [\App\Http\Controllers\Api\MediaController::class, 'store']);
    Route::get('service-requests/{serviceRequest}/media/{media}', [\App\Http\Controllers\Api\MediaController::class, 'show']);
    Route::delete('service-requests/{serviceRequest}/media/{media}', [\App\Http\Controllers\Api\MediaController::class, 'destroy']);

    // Activity Logs (admin only)
    Route::get('activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
    Route::get('activity-logs/{activityLog}', [\App\Http\Controllers\Api\ActivityLogController::class, 'show']);
});
