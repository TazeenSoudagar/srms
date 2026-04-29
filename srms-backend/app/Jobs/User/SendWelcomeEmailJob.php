<?php

declare(strict_types=1);

namespace App\Jobs\User;

use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 5;

    protected User $user;

    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        // Password is not forwarded — welcome email only needs name
    }

    public function handle(): void
    {
        $response = Http::withHeaders([
            'X-Service-Token' => config('services.notification.token'),
        ])->post(config('services.notification.url').'/email/send-welcome', [
            'email' => $this->user->email,
            'name'  => $this->user->name,
        ]);

        if ($response->failed()) {
            Log::warning('[SendWelcomeEmailJob] Notification service returned error', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'user_id' => $this->user->id,
            ]);
            throw new Exception('Notification service failed: '.$response->body());
        }
    }

    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send welcome email after all retries', [
            'user_id'   => $this->user->id,
            'email'     => $this->user->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
