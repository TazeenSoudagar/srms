<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ComplaintOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Complaint $complaint,
        public string $otp
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'format' => 'filament',
            'title' => 'Complaint Resolution OTP',
            'body' => "Your OTP to confirm resolution of complaint #{$this->complaint->complaint_number} is: {$this->otp}. Share this with the engineer.",
            'complaint_id' => Hashids::encode($this->complaint->id),
            'complaint_number' => $this->complaint->complaint_number,
            'otp' => $this->otp,
            'icon' => 'heroicon-o-key',
            'color' => 'info',
        ];
    }
}
