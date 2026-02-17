<?php

namespace App\Policies;

use App\Models\ServiceSchedule;
use App\Models\User;

class ServiceSchedulePolicy
{
    /**
     * Determine if the user can view any schedules.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the schedule.
     */
    public function view(User $user, ServiceSchedule $schedule): bool
    {
        // Admin can view all
        if ($user->role->name === 'Admin') {
            return true;
        }

        // Customer can view their own schedules
        if ($user->role->name === 'Client' && $schedule->customer_id === $user->id) {
            return true;
        }

        // Engineer can view their assigned schedules
        if ($user->role->name === 'Support Engineer' && $schedule->engineer_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create schedules.
     */
    public function create(User $user): bool
    {
        // Clients and admins can create schedules
        return in_array($user->role->name, ['Client', 'Admin']);
    }

    /**
     * Determine if the user can update the schedule.
     */
    public function update(User $user, ServiceSchedule $schedule): bool
    {
        // Admin can update all
        if ($user->role->name === 'Admin') {
            return true;
        }

        // Customer can update their own schedules if editable
        if ($user->role->name === 'Client'
            && $schedule->customer_id === $user->id
            && $schedule->isEditable()) {
            return true;
        }

        // Engineer can update assigned schedules
        if ($user->role->name === 'Support Engineer' && $schedule->engineer_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can cancel the schedule.
     */
    public function cancel(User $user, ServiceSchedule $schedule): bool
    {
        // Admin can cancel all
        if ($user->role->name === 'Admin') {
            return true;
        }

        // Customer can cancel their own schedules if cancellable
        if ($user->role->name === 'Client'
            && $schedule->customer_id === $user->id
            && $schedule->isCancellable()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can complete the schedule.
     */
    public function complete(User $user, ServiceSchedule $schedule): bool
    {
        // Only engineers can complete schedules
        return $user->role->name === 'Support Engineer'
            && $schedule->engineer_id === $user->id
            && $schedule->status === 'in_progress';
    }

    /**
     * Determine if the user can delete the schedule.
     */
    public function delete(User $user, ServiceSchedule $schedule): bool
    {
        // Only admin can delete
        return $user->role->name === 'Admin';
    }
}
