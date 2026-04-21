<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Invoice;
use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public ServiceSchedule $schedule
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invoice {$this->invoice->invoice_number} – Your Service is Complete",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.invoice-mail',
            with: [
                'invoice'        => $this->invoice,
                'customerName'   => $this->schedule->customer->first_name,
                'serviceName'    => $this->schedule->serviceRequest->service->name,
                'requestNumber'  => $this->schedule->serviceRequest->request_number,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('local', $this->invoice->pdf_path)
                ->as("{$this->invoice->invoice_number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
