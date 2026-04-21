<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    private function isAdmin(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'admin';
    }

    private function isSupportEngineer(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'support engineer';
    }

    private function isClient(User $user): bool
    {
        return $user->role && strtolower($user->role->name) === 'client';
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Complaint $complaint): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isSupportEngineer($user)) {
            return $complaint->assigned_engineer_id === $user->id;
        }

        if ($this->isClient($user)) {
            return $complaint->created_by === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $this->isClient($user);
    }

    public function update(User $user, Complaint $complaint): bool
    {
        return $this->isAdmin($user);
    }

    public function close(User $user, Complaint $complaint): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ($this->isSupportEngineer($user)) {
            return $complaint->assigned_engineer_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Complaint $complaint): bool
    {
        return $this->isAdmin($user);
    }
}
