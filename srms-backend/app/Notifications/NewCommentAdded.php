<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCommentAdded extends Notification
{
    use Queueable;

    public function __construct(
        public Comment $comment
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $commentable = $this->comment->commentable;
        $requestNumber = $commentable?->request_number ?? 'Unknown';

        return [
            'title' => 'New Comment Added',
            'message' => "A new comment was added to service request #{$requestNumber}.",
            'comment_id' => $this->comment->id,
            'service_request_id' => $commentable?->id,
            'request_number' => $requestNumber,
            'icon' => 'heroicon-o-chat-bubble-left-right',
            'color' => 'info',
        ];
    }
}
