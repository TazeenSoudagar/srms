<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    /**
     * Check if user has admin role.
     */
    private function isAdmin(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'admin';
    }

    /**
     * Determine whether the user can view any models.
     * All authenticated users can view services.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * All authenticated users can view services.
     */
    public function view(User $user, Service $service): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Only admins can create services.
     */
    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can update the model.
     * Only admins can update services.
     */
    public function update(User $user, Service $service): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can delete the model.
     * Only admins can delete services.
     */
    public function delete(User $user, Service $service): bool
    {
        return $this->isAdmin($user);
    }
}
