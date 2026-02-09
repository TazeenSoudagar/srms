<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated user
     */
    public function getStats(): JsonResponse
    {
        $user = Auth::user();

        // Get all service requests for this user (filtered by role via scopeForUser)
        $requests = ServiceRequest::forUser($user)
            ->where('is_active', true)
            ->get();

        // Calculate basic stats
        $total = $requests->count();
        $open = $requests->where('status', 'open')->count();
        $inProgress = $requests->where('status', 'in_progress')->count();
        $closed = $requests->where('status', 'closed')->count();

        // Calculate priority stats
        $highPriority = $requests->where('priority', 'high')->whereIn('status', ['open', 'in_progress'])->count();

        // Calculate overdue requests (past due_date and not closed)
        $overdue = $requests->filter(function ($request) {
            return $request->due_date
                && $request->due_date < now()
                && $request->status !== 'closed';
        })->count();

        // Calculate requests due within 7 days
        $dueWithin7Days = $requests->filter(function ($request) {
            return $request->due_date
                && $request->due_date >= now()
                && $request->due_date <= now()->addDays(7)
                && $request->status !== 'closed';
        })->count();

        return response()->json([
            'total' => $total,
            'open' => $open,
            'in_progress' => $inProgress,
            'closed' => $closed,
            'high_priority' => $highPriority,
            'overdue' => $overdue,
            'due_within_7_days' => $dueWithin7Days,
        ]);
    }
}
