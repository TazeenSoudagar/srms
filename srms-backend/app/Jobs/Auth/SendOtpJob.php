<?php

namespace App\Jobs\Auth;

use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;

class SendOtpJob implements ShouldQueue
{
    use Queueable;

    protected  string $email;
    protected  string $otp;

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
        Mail::to($this->email)
        ->send(new SendOtpMail($this->otp));
    }
}
