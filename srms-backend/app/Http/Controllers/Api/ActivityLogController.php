<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the activity logs.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ActivityLog::class);

        $query = ActivityLog::with(['user.role', 'loggable']);

        // Date range filter
        if (request()->filled('date_filter')) {
            $dateFilter = request('date_filter');
            $now = Carbon::now();

            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('created_at', $now->toDateString());
                    break;
                case 'week':
                    $query->whereBetween('created_at', [
                        $now->startOfWeek()->toDateTimeString(),
                        $now->endOfWeek()->toDateTimeString()
                    ]);
                    break;
                case 'month':
                    $query->whereMonth('created_at', $now->month)
                        ->whereYear('created_at', $now->year);
                    break;
                case 'year':
                    $query->whereYear('created_at', $now->year);
                    break;
                case 'all':
                    // No date filter
                    break;
            }
        } else {
            // Default to today
            $query->whereDate('created_at', Carbon::now()->toDateString());
        }

        // Model/Entity type filter
        if (request()->filled('loggable_type')) {
            $loggableType = request('loggable_type');

            // Map friendly names to full class names
            $modelMap = [
                'ServiceRequest' => 'App\\Models\\ServiceRequest',
                'User' => 'App\\Models\\User',
                'Comment' => 'App\\Models\\Comment',
                'Service' => 'App\\Models\\Service',
            ];

            if (isset($modelMap[$loggableType])) {
                $query->where('loggable_type', $modelMap[$loggableType]);
            }
        }

        // Role filter (filter by the role of the user who performed the action)
        if (request()->filled('role_id')) {
            $query->whereHas('user', function ($q) {
                $q->where('role_id', request('role_id'));
            });
        }

        // Action filter
        if (request()->filled('action')) {
            $query->where('action', request('action'));
        }

        // Search filter (search in user name or details)
        if (request()->filled('search')) {
            $search = request('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('action', 'like', "%{$search}%")
                ->orWhereJsonContains('details', $search);
            });
        }

        $activityLogs = $query->latest()->paginate(request('per_page', 20));

        return ActivityLogResource::collection($activityLogs);
    }

    /**
     * Display the specified activity log.
     */
    public function show(ActivityLog $activityLog): ActivityLogResource
    {
        $this->authorize('view', $activityLog);

        return new ActivityLogResource($activityLog->load(['user.role', 'loggable']));
    }
}
