<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ServiceRequest;
use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentProofUploaded extends Notification
{
    use Queueable;

    public function __construct(
        public readonly ServiceSchedule $schedule,
        public readonly ServiceRequest $serviceRequest,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'               => 'payment_proof_uploaded',
            'title'              => 'Payment Proof Uploaded',
            'body'               => "Customer has uploaded payment proof for {$this->serviceRequest->request_number}. Please review and verify.",
            'service_request_id' => $this->serviceRequest->id,
            'schedule_id'        => $this->schedule->id,
            'request_number'     => $this->serviceRequest->request_number,
            'invoice_number'     => $this->schedule->invoice?->invoice_number,
            'total_amount'       => $this->schedule->total_amount,
            'payment_uploaded_at'=> $this->schedule->payment_uploaded_at?->toISOString(),
        ];
    }
}
