<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplaintResolutionOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly string $complaintNumber
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'SRMS - Confirm Complaint Resolution');
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.complaint-resolution-otp-mail',
            with: ['otp' => $this->otp, 'complaintNumber' => $this->complaintNumber],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
