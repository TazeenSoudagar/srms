<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ServiceRequestStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceRequest $serviceRequest,
        public string $oldStatus,
        public string $newStatus
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'format' => 'filament',
            'title' => 'Service Request Status Changed',
            'body' => "Service request #{$this->serviceRequest->request_number} status changed from {$this->oldStatus} to {$this->newStatus}.",
            'service_request_id' => Hashids::encode($this->serviceRequest->id),
            'request_number' => $this->serviceRequest->request_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'icon' => 'heroicon-o-arrow-path',
            'color' => 'warning',
        ];
    }
}
