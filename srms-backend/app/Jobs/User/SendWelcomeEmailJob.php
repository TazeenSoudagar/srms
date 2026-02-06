<?php

declare(strict_types=1);

namespace App\Jobs\User;

use App\Mail\WelcomeUserMail;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\UnexpectedResponseException;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 5;

    protected User $user;

    protected string $password;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::to($this->user->email)->send(new WelcomeUserMail($this->user, $this->password));
        } catch (UnexpectedResponseException $e) {
            // Handle Mailtrap rate limiting specifically
            if (str_contains($e->getMessage(), 'Too many emails per second')) {
                Log::warning('Mailtrap rate limit hit, job will retry', [
                    'user_id' => $this->user->id,
                    'email' => $this->user->email,
                    'attempt' => $this->attempts(),
                ]);

                // Throw exception to trigger retry
                throw $e;
            }

            // Re-throw other mail exceptions
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Exception $exception): void
    {
        Log::error('Failed to send welcome email after all retries', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
