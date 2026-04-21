<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class AdminNewComment extends Notification
{
    use Queueable;

    public function __construct(
        public Comment $comment,
        public ServiceRequest $serviceRequest
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $author = $this->comment->user;
        $authorName = $author ? trim("{$author->first_name} {$author->last_name}") : 'A user';
        $preview = mb_strimwidth(strip_tags($this->comment->body), 0, 80, '…');

        return [
            'format' => 'filament',
            'title'              => 'New Comment on Service Request',
            'body'            => "{$authorName} commented on #{$this->serviceRequest->request_number}: \"{$preview}\"",
            'service_request_id' => Hashids::encode($this->serviceRequest->id),
            'request_number'     => $this->serviceRequest->request_number,
            'comment_id'         => $this->comment->id,
            'author_name'        => $authorName,
            'icon'               => 'heroicon-o-chat-bubble-left-right',
            'color'              => 'warning',
        ];
    }
}
