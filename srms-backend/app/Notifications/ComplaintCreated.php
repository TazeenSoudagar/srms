<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ComplaintCreated extends Notification
{
    use Queueable;

    public function __construct(public Complaint $complaint) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'format' => 'filament',
            'title' => 'New Complaint Raised',
            'body' => "Complaint #{$this->complaint->complaint_number} raised for service request #{$this->complaint->serviceRequest->request_number}.",
            'complaint_id' => Hashids::encode($this->complaint->id),
            'complaint_number' => $this->complaint->complaint_number,
            'icon' => 'heroicon-o-exclamation-triangle',
            'color' => 'danger',
        ];
    }
}
