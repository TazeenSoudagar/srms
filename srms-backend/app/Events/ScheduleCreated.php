<?php

namespace App\Events;

use App\Models\ServiceSchedule;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ServiceSchedule $schedule;

    /**
     * Create a new event instance.
     */
    public function __construct(ServiceSchedule $schedule)
    {
        $this->schedule = $schedule;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('schedules'),
            new Channel('user.' . $this->schedule->customer_id),
            $this->schedule->engineer_id
                ? new Channel('user.' . $this->schedule->engineer_id)
                : null,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'schedule.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'schedule' => [
                'id' => $this->schedule->hashed_id,
                'scheduled_at' => $this->schedule->scheduled_at->toIso8601String(),
                'status' => $this->schedule->status,
                'customer_name' => $this->schedule->customer->first_name . ' ' . $this->schedule->customer->last_name,
                'engineer_name' => $this->schedule->engineer
                    ? $this->schedule->engineer->first_name . ' ' . $this->schedule->engineer->last_name
                    : null,
            ],
            'message' => 'A new schedule has been created',
        ];
    }
}
