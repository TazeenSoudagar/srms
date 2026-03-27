<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Media;
use App\Models\ServiceRequest;
use App\Models\User;

class MediaPolicy
{
    /**
     * Determine whether the user can view any models.
     * Access control handled at service request level.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * User must have access to the related service request.
     */
    public function view(User $user, Media $media): bool
    {
        if ($media->mediaable_type === ServiceRequest::class) {
            $serviceRequest = ServiceRequest::find($media->mediaable_id);
            if ($serviceRequest) {
                return $user->can('view', $serviceRequest);
            }
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * Access control handled at service request level.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     * Only the request creator (customer) can delete media.
     * Admin can also delete media.
     */
    public function delete(User $user, Media $media, ?ServiceRequest $serviceRequest = null): bool
    {
        // If service request is provided directly, use it
        if ($serviceRequest) {
            $isAdmin = $user->role && strtolower($user->role->name) === 'admin';
            $isCreator = $serviceRequest->created_by === $user->id;

            return $isAdmin || $isCreator;
        }

        // Otherwise, load it from the media relationship
        if ($media->mediaable_type === ServiceRequest::class) {
            $serviceRequest = ServiceRequest::find($media->mediaable_id);
            if ($serviceRequest) {
                $isAdmin = $user->role && strtolower($user->role->name) === 'admin';
                $isCreator = $serviceRequest->created_by === $user->id;

                return $isAdmin || $isCreator;
            }
        }

        return false;
    }
}
