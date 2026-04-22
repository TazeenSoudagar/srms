<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ComplaintAssigned extends Notification
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
            'title' => 'Complaint Assigned To You',
            'body' => "Complaint #{$this->complaint->complaint_number} has been assigned to you. Please investigate and resolve.",
            'complaint_id' => Hashids::encode($this->complaint->id),
            'complaint_number' => $this->complaint->complaint_number,
            'icon' => 'heroicon-o-user-circle',
            'color' => 'warning',
        ];
    }
}
