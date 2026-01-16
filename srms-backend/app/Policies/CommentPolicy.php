<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Comment;
use App\Models\ServiceRequest;
use App\Models\User;

class CommentPolicy
{
    /**
     * Determine whether the user can view any models.
     * All authenticated users can view comments on accessible service requests.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * All authenticated users can view comments on accessible service requests.
     */
    public function view(User $user, Comment $comment): bool
    {
        return true; // Access control handled at service request level
    }

    /**
     * Determine whether the user can create models.
     * All authenticated users can create comments on accessible service requests.
     */
    public function create(User $user): bool
    {
        return true; // Access control handled at service request level
    }

    /**
     * Determine whether the user can update the model.
     * Users can only update their own comments, and must have access to the service request.
     */
    public function update(User $user, Comment $comment): bool
    {
        // Must be the comment owner
        if ($comment->user_id !== $user->id) {
            return false;
        }

        // Verify access to the underlying service request
        if ($comment->commentable_type === ServiceRequest::class) {
            $serviceRequest = ServiceRequest::find($comment->commentable_id);
            if ($serviceRequest) {
                return $user->can('view', $serviceRequest);
            }
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Users can only delete their own comments (with service request access), or admins can delete any.
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Admins can delete any comment if they have access to the service request
        if ($user->role && strtolower($user->role->name) === 'admin') {
            if ($comment->commentable_type === ServiceRequest::class) {
                $serviceRequest = ServiceRequest::find($comment->commentable_id);
                if ($serviceRequest) {
                    return $user->can('view', $serviceRequest);
                }
            }

            return false;
        }

        // Non-admins can only delete their own comments
        if ($comment->user_id !== $user->id) {
            return false;
        }

        // Verify access to the underlying service request
        if ($comment->commentable_type === ServiceRequest::class) {
            $serviceRequest = ServiceRequest::find($comment->commentable_id);
            if ($serviceRequest) {
                return $user->can('view', $serviceRequest);
            }
        }

        return false;
    }
}
