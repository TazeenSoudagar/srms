<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    private function notificationServiceUrl(): string
    {
        return rtrim(config('services.notification.url'), '/');
    }

    private function forwardHeaders(Request $request): array
    {
        return [
            'Authorization' => $request->header('Authorization'),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $response = Http::withHeaders($this->forwardHeaders($request))
            ->get($this->notificationServiceUrl().'/notifications', [
                'page' => $request->query('page', 1),
            ]);

        if ($response->failed()) {
            Log::error('[NotificationController] index failed', ['status' => $response->status()]);
            return response()->json(['error' => 'Notification service unavailable'], 502);
        }

        return response()->json($response->json());
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $response = Http::withHeaders($this->forwardHeaders($request))
            ->post($this->notificationServiceUrl().'/notifications/'.$id.'/read');

        if ($response->status() === 404) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        if ($response->failed()) {
            Log::error('[NotificationController] markAsRead failed', ['status' => $response->status()]);
            return response()->json(['error' => 'Notification service unavailable'], 502);
        }

        return response()->json($response->json());
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $response = Http::withHeaders($this->forwardHeaders($request))
            ->post($this->notificationServiceUrl().'/notifications/read-all');

        if ($response->failed()) {
            Log::error('[NotificationController] markAllAsRead failed', ['status' => $response->status()]);
            return response()->json(['error' => 'Notification service unavailable'], 502);
        }

        return response()->json($response->json());
    }

    public function clearAll(Request $request): JsonResponse
    {
        $response = Http::withHeaders($this->forwardHeaders($request))
            ->delete($this->notificationServiceUrl().'/notifications');

        if ($response->failed()) {
            Log::error('[NotificationController] clearAll failed', ['status' => $response->status()]);
            return response()->json(['error' => 'Notification service unavailable'], 502);
        }

        return response()->json($response->json());
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $response = Http::withHeaders($this->forwardHeaders($request))
            ->get($this->notificationServiceUrl().'/notifications/unread-count');

        if ($response->failed()) {
            Log::error('[NotificationController] unreadCount failed', ['status' => $response->status()]);
            return response()->json(['error' => 'Notification service unavailable'], 502);
        }

        return response()->json($response->json());
    }
}
