<?php

declare(strict_types=1);

namespace App\Jobs\Auth;

use App\Mail\ServiceCompletionOtpMail;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendServiceCompletionOtpJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 5;

    public function __construct(
        protected string $email,
        protected string $otp,
        protected string $requestNumber
    ) {}

    public function handle(): void
    {
        Mail::to($this->email)->send(new ServiceCompletionOtpMail($this->otp, $this->requestNumber));
    }

    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send service completion OTP email after all retries', [
            'email' => $this->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
