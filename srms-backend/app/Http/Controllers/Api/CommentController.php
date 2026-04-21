<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\AdminNewComment;
use App\Notifications\NewCommentAdded;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for a service request.
     */
    public function index(ServiceRequest $serviceRequest): AnonymousResourceCollection
    {
        // Check if user can view the service request
        $this->authorize('view', $serviceRequest);

        $comments = $serviceRequest->comments()
            ->with('user.role')
            ->latest()
            ->get();

        return CommentResource::collection($comments);
    }

    /**
     * Store a newly created comment.
     */
    public function store(StoreCommentRequest $request, ServiceRequest $serviceRequest): JsonResponse
    {
        // Check if user can view the service request (to add comments)
        $this->authorize('view', $serviceRequest);

        $user = Auth::user();

        $comment = Comment::create([
            'commentable_id' => $serviceRequest->id,
            'commentable_type' => ServiceRequest::class,
            'user_id' => $user->id,
            'body' => $request->body,
        ]);

        $comment->load('user.role');

        // Log activity
        ActivityLogService::logCreated($user, $comment, [
            'service_request_id' => $serviceRequest->id,
            'service_request_number' => $serviceRequest->request_number,
        ]);

        $roleName = $user->role?->name;

        if ($roleName === 'Client') {
            // Customer commented — notify admins and the assigned engineer
            $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
            Notification::send($admins, new AdminNewComment($comment, $serviceRequest));

            $serviceRequest->loadMissing('schedules.engineer');
            $serviceRequest->schedules->each(function ($schedule) use ($comment, $serviceRequest, $user) {
                if ($schedule->engineer && $schedule->engineer->id !== $user->id) {
                    $schedule->engineer->notify(new NewCommentAdded($comment));
                }
            });
        } elseif (\in_array($roleName, ['Support Engineer', 'Admin'], true)) {
            // Engineer or admin commented — notify the customer
            $customer = User::find($serviceRequest->created_by);
            if ($customer && $customer->id !== $user->id) {
                $customer->notify(new NewCommentAdded($comment));
            }

            // Also notify admins if a support engineer commented
            if ($roleName === 'Support Engineer') {
                $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
                Notification::send($admins, new AdminNewComment($comment, $serviceRequest));
            }
        }

        return (new CommentResource($comment))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified comment.
     */
    public function show(ServiceRequest $serviceRequest, Comment $comment): CommentResource
    {
        // Verify comment belongs to service request
        if ($comment->commentable_id !== $serviceRequest->id || $comment->commentable_type !== ServiceRequest::class) {
            abort(404, 'Comment not found for this service request.');
        }

        $this->authorize('view', $comment);
        $this->authorize('view', $serviceRequest);

        $comment->load('user.role');

        return new CommentResource($comment);
    }

    /**
     * Update the specified comment.
     */
    public function update(StoreCommentRequest $request, ServiceRequest $serviceRequest, Comment $comment): CommentResource
    {
        // Verify comment belongs to service request
        if ($comment->commentable_id !== $serviceRequest->id || $comment->commentable_type !== ServiceRequest::class) {
            abort(404, 'Comment not found for this service request.');
        }

        // Check service request access first (policy will also check this, but this provides better error messages)
        $this->authorize('view', $serviceRequest);
        $this->authorize('update', $comment);

        $user = Auth::user();

        $comment->update([
            'body' => $request->body,
        ]);

        $comment->load('user.role');

        // Log activity
        ActivityLogService::logUpdated($user, $comment, [
            'service_request_id' => $serviceRequest->id,
        ]);

        return new CommentResource($comment);
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(ServiceRequest $serviceRequest, Comment $comment): JsonResponse
    {
        // Verify comment belongs to service request
        if ($comment->commentable_id !== $serviceRequest->id || $comment->commentable_type !== ServiceRequest::class) {
            abort(404, 'Comment not found for this service request.');
        }

        // Check service request access first (policy will also check this, but this provides better error messages)
        $this->authorize('view', $serviceRequest);
        $this->authorize('delete', $comment);

        $user = Auth::user();

        // Log activity before deletion
        ActivityLogService::logDeleted($user, $comment, [
            'service_request_id' => $serviceRequest->id,
        ]);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ], 200);
    }
}
