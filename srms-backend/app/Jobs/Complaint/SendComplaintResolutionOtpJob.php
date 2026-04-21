<?php

declare(strict_types=1);

namespace App\Jobs\Complaint;

use App\Mail\ComplaintResolutionOtpMail;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendComplaintResolutionOtpJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 5;

    public function __construct(
        protected string $email,
        protected string $otp,
        protected string $complaintNumber
    ) {}

    public function handle(): void
    {
        Mail::to($this->email)->send(new ComplaintResolutionOtpMail($this->otp, $this->complaintNumber));
    }

    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send complaint resolution OTP email after all retries', [
            'email' => $this->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
