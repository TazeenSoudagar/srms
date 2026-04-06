<?php

namespace App\Observers;

use App\Models\ServiceRequest;

class ServiceRequestObserver
{
    /**
     * Handle the ServiceRequest "creating" event.
     */
    public function creating(ServiceRequest $serviceRequest): void
    {
        // If creating a request with status 'closed', set closed_at
        if ($serviceRequest->status?->value === 'closed' && ! $serviceRequest->closed_at) {
            $serviceRequest->closed_at = now();
        }
    }

    /**
     * Handle the ServiceRequest "updating" event.
     */
    public function updating(ServiceRequest $serviceRequest): void
    {
        // Check if status is changing to 'closed'
        if ($serviceRequest->isDirty('status')) {
            $newStatus = $serviceRequest->status?->value;
            $oldStatus = $serviceRequest->getOriginal('status');

            // If changing to 'closed', set closed_at timestamp
            if ($newStatus === 'closed' && ! $serviceRequest->closed_at) {
                $serviceRequest->closed_at = now();
            }

            // If changing from 'closed' to another status, clear closed_at
            if ($oldStatus === 'closed' && $newStatus !== 'closed') {
                $serviceRequest->closed_at = null;
            }
        }
    }

    /**
     * Handle the ServiceRequest "deleted" event.
     */
    public function deleted(ServiceRequest $serviceRequest): void
    {
        //
    }

    /**
     * Handle the ServiceRequest "restored" event.
     */
    public function restored(ServiceRequest $serviceRequest): void
    {
        //
    }

    /**
     * Handle the ServiceRequest "force deleted" event.
     */
    public function forceDeleted(ServiceRequest $serviceRequest): void
    {
        //
    }
}
