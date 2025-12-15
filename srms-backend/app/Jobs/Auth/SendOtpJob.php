<?php

declare(strict_types=1);

namespace App\Jobs\Auth;

use App\Mail\SendOtpMail;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\UnexpectedResponseException;

class SendOtpJob implements ShouldQueue
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

    protected string $email;

    protected string $otp;

    /**
     * Create a new job instance.
     */
    public function __construct(string $email, string $otp)
    {
        $this->email = $email;
        $this->otp = $otp;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::to($this->email)->send(new SendOtpMail($this->otp));
        } catch (UnexpectedResponseException $e) {
            // Handle Mailtrap rate limiting specifically
            if (str_contains($e->getMessage(), 'Too many emails per second')) {
                Log::warning('Mailtrap rate limit hit, job will retry', [
                    'email' => $this->email,
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
        Log::error('Failed to send OTP email after all retries', [
            'email' => $this->email,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
