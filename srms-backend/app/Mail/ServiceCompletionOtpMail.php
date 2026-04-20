<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ServiceCompletionOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly string $requestNumber
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'SRMS - Confirm Service Completion');
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.service-completion-otp-mail',
            with: ['otp' => $this->otp, 'requestNumber' => $this->requestNumber],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
