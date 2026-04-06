<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

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
            'title' => 'New Service Request Created',
            'message' => "Service request #{$this->serviceRequest->request_number} has been created.",
            'service_request_id' => $this->serviceRequest->id,
            'request_number' => $this->serviceRequest->request_number,
            'icon' => 'heroicon-o-clipboard-document-list',
            'color' => 'success',
        ];
    }
}
