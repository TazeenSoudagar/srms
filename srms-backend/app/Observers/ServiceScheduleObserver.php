<?php

namespace App\Observers;

use App\Events\ScheduleUpdated;
use App\Jobs\SendInvoiceJob;
use App\Models\ServiceSchedule;
use App\Notifications\ScheduleStatusUpdated;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\Log;

class ServiceScheduleObserver
{
    /**
     * Handle the ServiceSchedule "creating" event.
     */
    public function creating(ServiceSchedule $serviceSchedule): void
    {
        if ($serviceSchedule->status === 'completed' && ! $serviceSchedule->completed_at) {
            $serviceSchedule->completed_at = now();
        }
    }

    /**
     * Handle the ServiceSchedule "updating" event.
     */
    public function updating(ServiceSchedule $serviceSchedule): void
    {
        if (! $serviceSchedule->isDirty('status')) {
            return;
        }

        $newStatus = $serviceSchedule->status;
        $oldStatus = $serviceSchedule->getOriginal('status');

        if ($newStatus === 'completed' && ! $serviceSchedule->completed_at) {
            $serviceSchedule->completed_at = now();
        }

        if ($oldStatus === 'completed' && $newStatus !== 'completed') {
            $serviceSchedule->completed_at = null;
        }
    }

    /**
     * Handle the ServiceSchedule "updated" event.
     * Syncs the parent ServiceRequest status, broadcasts the change,
     * and notifies the customer when the schedule status changes.
     */
    public function updated(ServiceSchedule $serviceSchedule): void
    {
        if (! $serviceSchedule->wasChanged('status')) {
            return;
        }

        $oldStatus = $serviceSchedule->getOriginal('status');
        $newStatus = $serviceSchedule->status;

        $this->syncRequestStatus($serviceSchedule);

        // Ensure relations are loaded for the broadcast payload
        $serviceSchedule->loadMissing(['customer', 'engineer', 'serviceRequest']);

        broadcast(new ScheduleUpdated($serviceSchedule));

        // Generate invoice BEFORE notifying customer so notification includes invoice details
        if ($newStatus === 'completed') {
            if ($serviceSchedule->actual_price !== null) {
                try {
                    $invoice = app(InvoiceService::class)->generateForSchedule($serviceSchedule);
                    SendInvoiceJob::dispatch($invoice, $serviceSchedule);
                    $serviceSchedule->setRelation('invoice', $invoice);
                } catch (\Throwable $e) {
                    Log::error("Invoice generation failed for schedule #{$serviceSchedule->id}: {$e->getMessage()}");
                }
            } else {
                Log::warning("Schedule #{$serviceSchedule->id} completed without actual_price — invoice not generated.");
            }
        }

        // Notify customer — for 'completed', invoice relation is already loaded above
        $serviceSchedule->customer?->notify(
            new ScheduleStatusUpdated($serviceSchedule, $oldStatus)
        );
    }

    /**
     * Derive and apply the correct ServiceRequest status from all its schedules.
     *
     * Rules:
     * - Any schedule completed           → request closed
     * - All schedules cancelled          → request reverts to open
     * - Any schedule active (non-cancelled, non-completed) → request in_progress
     */
    private function syncRequestStatus(ServiceSchedule $serviceSchedule): void
    {
        $request = $serviceSchedule->serviceRequest;

        if (! $request) {
            return;
        }

        // Never touch a request that was explicitly closed or cancelled by a user action
        if (in_array($request->status?->value ?? $request->status, ['closed', 'cancelled'])) {
            return;
        }

        $statuses = $request->schedules()->pluck('status')->all();

        $newRequestStatus = $this->deriveRequestStatus($statuses);

        $update = ['status' => $newRequestStatus];

        if ($newRequestStatus === 'closed') {
            $update['closed_at'] = now();
        } elseif ($newRequestStatus === 'open') {
            $update['closed_at'] = null;
        }

        $request->update($update);
    }

    /**
     * Derive the request status from a list of schedule statuses.
     */
    private function deriveRequestStatus(array $statuses): string
    {
        if (in_array('completed', $statuses)) {
            return 'closed';
        }

        $nonCancelled = array_filter($statuses, fn ($s) => $s !== 'cancelled');

        return empty($nonCancelled) ? 'open' : 'in_progress';
    }

    /**
     * Handle the ServiceSchedule "deleted" event.
     */
    public function deleted(ServiceSchedule $_): void
    {
        // No action needed on delete
    }

    public function restored(ServiceSchedule $_): void
    {
        // No action needed on restore
    }

    public function forceDeleted(ServiceSchedule $_): void
    {
        // No action needed on force delete
    }
}
