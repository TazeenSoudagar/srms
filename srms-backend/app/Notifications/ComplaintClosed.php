<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ComplaintClosed extends Notification
{
    use Queueable;

    public function __construct(
        public Complaint $complaint,
        public string $closedBy = 'engineer'
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $isAdminClose = $this->closedBy === 'admin';

        return [
            'format' => 'filament',
            'title' => 'Complaint Closed',
            'body' => $isAdminClose
                ? "Your complaint #{$this->complaint->complaint_number} has been closed by admin. Note: {$this->complaint->admin_note}"
                : "Complaint #{$this->complaint->complaint_number} has been resolved and closed.",
            'complaint_id' => Hashids::encode($this->complaint->id),
            'complaint_number' => $this->complaint->complaint_number,
            'closed_by' => $this->closedBy,
            'admin_note' => $this->complaint->admin_note,
            'icon' => 'heroicon-o-check-circle',
            'color' => 'success',
        ];
    }
}
