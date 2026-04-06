<?php

namespace App\Observers;

use App\Models\ServiceSchedule;

class ServiceScheduleObserver
{
    /**
     * Handle the ServiceSchedule "creating" event.
     */
    public function creating(ServiceSchedule $serviceSchedule): void
    {
        // If creating a schedule with status 'completed', set completed_at
        if ($serviceSchedule->status === 'completed' && ! $serviceSchedule->completed_at) {
            $serviceSchedule->completed_at = now();
        }
    }

    /**
     * Handle the ServiceSchedule "updating" event.
     */
    public function updating(ServiceSchedule $serviceSchedule): void
    {
        // Check if status is changing to 'completed'
        if ($serviceSchedule->isDirty('status')) {
            $newStatus = $serviceSchedule->status;
            $oldStatus = $serviceSchedule->getOriginal('status');

            // If changing to 'completed', set completed_at timestamp
            if ($newStatus === 'completed' && ! $serviceSchedule->completed_at) {
                $serviceSchedule->completed_at = now();
            }

            // If changing from 'completed' to another status, clear completed_at
            if ($oldStatus === 'completed' && $newStatus !== 'completed') {
                $serviceSchedule->completed_at = null;
            }
        }
    }

    /**
     * Handle the ServiceSchedule "deleted" event.
     */
    public function deleted(ServiceSchedule $serviceSchedule): void
    {
        //
    }

    /**
     * Handle the ServiceSchedule "restored" event.
     */
    public function restored(ServiceSchedule $serviceSchedule): void
    {
        //
    }

    /**
     * Handle the ServiceSchedule "force deleted" event.
     */
    public function forceDeleted(ServiceSchedule $serviceSchedule): void
    {
        //
    }
}
