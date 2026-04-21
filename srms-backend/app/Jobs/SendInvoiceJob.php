<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Invoice $invoice,
        public ServiceSchedule $schedule
    ) {}

    public function handle(): void
    {
        $this->schedule->loadMissing(['customer', 'serviceRequest.service']);

        $customerEmail = $this->schedule->customer?->email;

        if (! $customerEmail) {
            Log::warning("SendInvoiceJob: no customer email for schedule #{$this->schedule->id}");

            return;
        }

        Mail::to($customerEmail)->send(new InvoiceMail($this->invoice, $this->schedule));

        $this->invoice->update(['sent_at' => now()]);
    }
}
