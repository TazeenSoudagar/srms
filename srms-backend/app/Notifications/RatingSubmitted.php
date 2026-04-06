<?php

namespace App\Notifications;

use App\Models\Rating;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RatingSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        public Rating $rating
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'New Rating Received',
            'message' => "You received a {$this->rating->rating}-star rating for service request #{$this->rating->serviceRequest->request_number}.",
            'rating_id' => $this->rating->id,
            'service_request_id' => $this->rating->service_request_id,
            'rating' => $this->rating->rating,
            'icon' => 'heroicon-o-star',
            'color' => 'warning',
        ];
    }
}
