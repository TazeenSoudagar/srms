<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log a creation action.
     *
     * @param  User  $user  The user performing the action
     * @param  Model  $loggable  The model being created
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function logCreated(User $user, Model $loggable, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'created', $loggable, $details);
    }

    /**
     * Log an update action.
     *
     * @param  User  $user  The user performing the action
     * @param  Model  $loggable  The model being updated
     * @param  array<string, mixed>  $details  Additional context data (e.g., changed fields)
     */
    public static function logUpdated(User $user, Model $loggable, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'updated', $loggable, $details);
    }

    /**
     * Log an assignment action.
     *
     * @param  User  $user  The user performing the assignment
     * @param  Model  $loggable  The model being assigned
     * @param  User  $assignedTo  The user being assigned to
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function logAssigned(User $user, Model $loggable, User $assignedTo, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'assigned', $loggable, array_merge($details, [
            'assigned_to' => $assignedTo->id,
            'assigned_to_name' => $assignedTo->first_name.' '.$assignedTo->last_name,
        ]));
    }

    /**
     * Log a status change action.
     *
     * @param  User  $user  The user performing the action
     * @param  Model  $loggable  The model whose status is changing
     * @param  string  $oldStatus  The previous status
     * @param  string  $newStatus  The new status
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function logStatusChanged(User $user, Model $loggable, string $oldStatus, string $newStatus, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'status_changed', $loggable, array_merge($details, [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]));
    }

    /**
     * Log a closure action.
     *
     * @param  User  $user  The user performing the action
     * @param  Model  $loggable  The model being closed
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function logClosed(User $user, Model $loggable, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'closed', $loggable, $details);
    }

    /**
     * Log a deletion action.
     *
     * @param  User  $user  The user performing the action
     * @param  Model  $loggable  The model being deleted
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function logDeleted(User $user, Model $loggable, array $details = []): ActivityLog
    {
        return ActivityLog::log($user, 'deleted', $loggable, $details);
    }
}
