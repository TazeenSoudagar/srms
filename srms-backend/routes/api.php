<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('send-otp', [AuthController::class, 'sendOtp'])
        ->middleware('throttle:5,1'); // 5 requests per minute

    Route::post('verify-otp', [AuthController::class, 'verifyOtp'])
        ->middleware('throttle:10,1'); // 10 requests per minute

    Route::post('login-password', [AuthController::class, 'loginPassword'])
        ->middleware('throttle:10,1'); // 10 requests per minute

    // Registration routes
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1'); // 5 requests per minute

    Route::post('verify-registration-otp', [AuthController::class, 'verifyRegistrationOtp'])
        ->middleware('throttle:10,1'); // 10 requests per minute

    Route::post('set-password', [AuthController::class, 'setPassword'])
        ->middleware('throttle:10,1'); // 10 requests per minute

    // Authenticated auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Public routes - No authentication required
Route::prefix('public')->group(function () {
    // Categories
    Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'show']);
    Route::get('categories/{category}/services', [\App\Http\Controllers\Api\CategoryController::class, 'services']);

    // Services - Browse and search
    Route::get('services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
    Route::get('services/featured', [\App\Http\Controllers\Api\ServiceController::class, 'featured']);
    Route::get('services/trending', [\App\Http\Controllers\Api\ServiceController::class, 'trending']);
    Route::get('services/popular', [\App\Http\Controllers\Api\ServiceController::class, 'popular']);
    Route::get('services/search', [\App\Http\Controllers\Api\ServiceController::class, 'search']);
    Route::get('services/{service}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::get('dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'getStats']);

    // Profile routes (for authenticated user)
    Route::prefix('profile')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
        Route::put('/', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::post('/change-password', [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        Route::post('/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'deleteAvatar']);
    });

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // Services - Admin only CRUD (Create, Update, Delete)
    Route::apiResource('services', \App\Http\Controllers\Api\ServiceController::class)
        ->except(['index', 'show']);

    // Service Requests
    Route::apiResource('service-requests', \App\Http\Controllers\Api\ServiceRequestController::class);
    Route::post('service-requests/{serviceRequest}/assign', [\App\Http\Controllers\Api\ServiceRequestController::class, 'assign']);
    Route::patch('service-requests/{serviceRequest}/status', [\App\Http\Controllers\Api\ServiceRequestController::class, 'updateStatus']);
    Route::post('service-requests/{serviceRequest}/close', [\App\Http\Controllers\Api\ServiceRequestController::class, 'close']);
    Route::post('service-requests/{serviceRequest}/cancel', [\App\Http\Controllers\Api\ServiceRequestController::class, 'cancel']);
    Route::post('service-requests/{serviceRequest}/request-completion', [\App\Http\Controllers\Api\ServiceCompletionController::class, 'requestCompletion']);
    Route::post('service-requests/{serviceRequest}/verify-completion', [\App\Http\Controllers\Api\ServiceCompletionController::class, 'verifyCompletion']);

    // Comments (nested under service requests)
    Route::get('service-requests/{serviceRequest}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::post('service-requests/{serviceRequest}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);
    Route::get('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'show']);
    Route::put('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'update']);
    Route::delete('service-requests/{serviceRequest}/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'destroy']);

    // Media/Attachments (nested under service requests)
    Route::get('service-requests/{serviceRequest}/media', [\App\Http\Controllers\Api\MediaController::class, 'index']);
    Route::post('service-requests/{serviceRequest}/media', [\App\Http\Controllers\Api\MediaController::class, 'store']);
    Route::get('service-requests/{serviceRequest}/media/{media}', [\App\Http\Controllers\Api\MediaController::class, 'show']);
    Route::delete('service-requests/{serviceRequest}/media/{media}', [\App\Http\Controllers\Api\MediaController::class, 'destroy']);

    // Ratings (nested under service requests)
    Route::post('service-requests/{serviceRequest}/rating', [
        \App\Http\Controllers\Api\RatingController::class, 'store',
    ]);
    Route::get('service-requests/{serviceRequest}/rating', [
        \App\Http\Controllers\Api\RatingController::class, 'show',
    ]);

    // Notifications
    Route::get('notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::get('notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);

    // Activity Logs (admin only)
    Route::get('activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
    Route::get('activity-logs/{activityLog}', [\App\Http\Controllers\Api\ActivityLogController::class, 'show']);

    // Invoice download
    Route::get('service-requests/{serviceRequest}/invoice', [\App\Http\Controllers\Api\InvoiceController::class, 'download']);

    // Payment proof
    Route::post('service-requests/{serviceRequest}/payment-proof', [\App\Http\Controllers\Api\PaymentController::class, 'uploadProof']);
    Route::get('service-requests/{serviceRequest}/payment-proof', [\App\Http\Controllers\Api\PaymentController::class, 'downloadProof']);
    Route::post('service-requests/{serviceRequest}/payment-verify', [\App\Http\Controllers\Api\PaymentController::class, 'verifyPayment']);

    // Service Schedules
    Route::prefix('schedules')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'store']);
        Route::get('/available-slots', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'availableSlots']);
        Route::get('/{schedule}', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'show']);
        Route::put('/{schedule}', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'update']);
        Route::post('/{schedule}/cancel', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'cancel']);
        Route::post('/{schedule}/complete', [\App\Http\Controllers\Api\ServiceScheduleController::class, 'complete']);
    });
});
