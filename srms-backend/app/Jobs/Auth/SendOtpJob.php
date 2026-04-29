<?php

declare(strict_types=1);

namespace App\Jobs\Auth;

use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendOtpJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 5;

    protected string $email;

    protected string $otp;

    public function __construct(string $email, string $otp)
    {
        $this->email = $email;
        $this->otp = $otp;
    }

    public function handle(): void
    {
        $response = Http::withHeaders([
            'X-Service-Token' => config('services.notification.token'),
        ])->post(config('services.notification.url').'/email/send-otp', [
            'email' => $this->email,
            'otp'   => $this->otp,
        ]);

        if ($response->failed()) {
            Log::warning('[SendOtpJob] Notification service returned error', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'email'  => $this->email,
            ]);
            throw new Exception('Notification service failed: '.$response->body());
        }
    }

    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send OTP email after all retries', [
            'email'     => $this->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
