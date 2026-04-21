<?php

namespace App\Notifications;

use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EngineerAssigned extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceSchedule $schedule
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $requestNumber = $this->schedule->serviceRequest?->request_number ?? 'Unknown';

        return [
            'format' => 'filament',
            'title' => 'New Assignment',
            'body' => "You have been assigned to service request #{$requestNumber}, scheduled for " . $this->schedule->scheduled_at->format('M j, Y g:i A'),
            'schedule_id' => $this->schedule->hashed_id,
            'service_request_id' => \Vinkla\Hashids\Facades\Hashids::encode($this->schedule->service_request_id),
            'scheduled_at' => $this->schedule->scheduled_at->toISOString(),
            'icon' => 'heroicon-o-briefcase',
            'color' => 'info',
        ];
    }
}
