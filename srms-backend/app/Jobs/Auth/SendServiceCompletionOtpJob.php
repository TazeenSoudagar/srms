<?php

declare(strict_types=1);

namespace App\Jobs\Auth;

use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $response = Http::withHeaders([
            'X-Service-Token' => config('services.notification.token'),
        ])->post(config('services.notification.url').'/email/send-completion-otp', [
            'email'          => $this->email,
            'otp'            => $this->otp,
            'request_number' => $this->requestNumber,
        ]);

        if ($response->failed()) {
            Log::warning('[SendServiceCompletionOtpJob] Notification service returned error', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'email'  => $this->email,
            ]);
            throw new Exception('Notification service failed: '.$response->body());
        }
    }

    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send service completion OTP email after all retries', [
            'email'     => $this->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
