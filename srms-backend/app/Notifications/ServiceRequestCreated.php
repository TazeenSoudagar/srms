<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ServiceRequestCreated extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceRequest $serviceRequest
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'format' => 'filament',
            'title' => 'New Service Request Created',
            'body' => "Service request #{$this->serviceRequest->request_number} has been created.",
            'service_request_id' => Hashids::encode($this->serviceRequest->id),
            'request_number' => $this->serviceRequest->request_number,
            'icon' => 'heroicon-o-clipboard-document-list',
            'color' => 'success',
        ];
    }
}
