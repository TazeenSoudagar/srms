<?php

namespace App\Notifications;

use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ScheduleStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceSchedule $schedule,
        public string $oldStatus,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusLabels = [
            'pending'     => 'Pending',
            'confirmed'   => 'Confirmed',
            'in_progress' => 'In Progress',
            'completed'   => 'Completed',
            'cancelled'   => 'Cancelled',
        ];

        $newLabel = $statusLabels[$this->schedule->status] ?? $this->schedule->status;

        return [
            'title'              => 'Schedule Status Updated',
            'message'            => "Your appointment scheduled for {$this->schedule->scheduled_at->format('M j, Y g:i A')} is now {$newLabel}.",
            'schedule_id'        => $this->schedule->hashed_id,
            'service_request_id' => \Vinkla\Hashids\Facades\Hashids::encode($this->schedule->service_request_id),
            'old_status'         => $this->oldStatus,
            'new_status'         => $this->schedule->status,
            'scheduled_at'       => $this->schedule->scheduled_at->toISOString(),
            'icon'               => 'heroicon-o-calendar',
            'color'              => 'info',
        ];
    }
}
