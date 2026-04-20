<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class AdminNewServiceRequest extends Notification
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
        $customer = $this->serviceRequest->createdBy;
        $customerName = $customer ? trim("{$customer->first_name} {$customer->last_name}") : 'A customer';

        return [
            'format' => 'filament',
            'title'              => 'New Service Request',
            'body'            => "{$customerName} submitted a new request: {$this->serviceRequest->title} (#{$this->serviceRequest->request_number}).",
            'service_request_id' => Hashids::encode($this->serviceRequest->id),
            'request_number'     => $this->serviceRequest->request_number,
            'customer_name'      => $customerName,
            'service'            => $this->serviceRequest->service?->name,
            'icon'               => 'heroicon-o-clipboard-document-list',
            'color'              => 'info',
        ];
    }
}
