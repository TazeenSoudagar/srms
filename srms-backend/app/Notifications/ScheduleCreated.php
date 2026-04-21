<?php

namespace App\Notifications;

use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ScheduleCreated extends Notification
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
        return [
            'format' => 'filament',
            'title' => 'Schedule Created',
            'body' => "A new appointment has been scheduled for " . $this->schedule->scheduled_at->format('M j, Y g:i A'),
            'schedule_id' => $this->schedule->hashed_id,
            'service_request_id' => \Vinkla\Hashids\Facades\Hashids::encode($this->schedule->service_request_id),
            'scheduled_at' => $this->schedule->scheduled_at->toISOString(),
            'icon' => 'heroicon-o-calendar',
            'color' => 'success',
        ];
    }
}
