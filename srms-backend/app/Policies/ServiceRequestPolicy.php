<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class ServiceRequestPolicy
{
    /**
     * Check if user has admin role.
     */
    private function isAdmin(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'admin';
    }

    /**
     * Check if user has support engineer role.
     */
    private function isSupportEngineer(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'support engineer';
    }

    /**
     * Check if user has client role.
     */
    private function isClient(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'client';
    }

    /**
     * Determine whether the user can view any models.
     * Admin: all requests
     * Support Engineer: assigned requests
     * Client: own requests
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view requests (filtered by role in controller)
        return true;
    }

    /**
     * Check if engineer is assigned to this request via a schedule.
     */
    private function isAssignedEngineer(User $user, ServiceRequest $serviceRequest): bool
    {
        return $serviceRequest->schedules()
            ->where('engineer_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can view the model.
     * Admin: all requests
     * Support Engineer: assigned requests (via schedules)
     * Client: own requests
     */
    public function view(User $user, ServiceRequest $serviceRequest): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isSupportEngineer($user)) {
            return $this->isAssignedEngineer($user, $serviceRequest);
        }

        if ($this->isClient($user)) {
            return $serviceRequest->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * All authenticated users can create requests.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Admin: all requests
     * Support Engineer: assigned requests only
     * Client: cannot update requests
     */
    public function update(User $user, ServiceRequest $serviceRequest): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isSupportEngineer($user)) {
            return $this->isAssignedEngineer($user, $serviceRequest);
        }

        return false;
    }

    /**
     * Determine whether the user can cancel the model.
     * Client: can cancel their own open requests
     * Admin: can cancel any request
     * Support Engineer: cannot cancel requests
     */
    public function cancel(User $user, ServiceRequest $serviceRequest): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isClient($user)) {
            // Client can only cancel their own requests that are still open
            return $serviceRequest->created_by === $user->id
                && $serviceRequest->status->value === 'open';
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Admin only.
     */
    public function delete(User $user, ServiceRequest $serviceRequest): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can assign a request to a support engineer.
     * Admin only.
     */
    public function assign(User $user, ServiceRequest $serviceRequest): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can close a request.
     * Admin: all requests
     * Support Engineer: assigned requests only
     * Client: cannot close requests
     */
    public function close(User $user, ServiceRequest $serviceRequest): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isSupportEngineer($user)) {
            return $this->isAssignedEngineer($user, $serviceRequest);
        }

        return false;
    }
}
