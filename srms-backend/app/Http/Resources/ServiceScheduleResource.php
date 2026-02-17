<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->hashed_id,
            'service_request' => [
                'id' => $this->serviceRequest->hashed_id,
                'title' => $this->serviceRequest->title,
                'service' => [
                    'id' => $this->serviceRequest->service->hashed_id,
                    'name' => $this->serviceRequest->service->name,
                ],
            ],
            'customer' => [
                'id' => $this->customer->hashed_id,
                'name' => $this->customer->first_name . ' ' . $this->customer->last_name,
                'email' => $this->customer->email,
                'phone' => $this->customer->phone,
            ],
            'engineer' => $this->engineer ? [
                'id' => $this->engineer->hashed_id,
                'name' => $this->engineer->first_name . ' ' . $this->engineer->last_name,
                'email' => $this->engineer->email,
            ] : null,
            'scheduled_at' => $this->scheduled_at->toIso8601String(),
            'scheduled_at_formatted' => $this->scheduled_at->format('M d, Y h:i A'),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'status' => $this->status,
            'notes' => $this->notes,
            'location' => $this->location,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
            'estimated_end_time' => $this->scheduled_at->copy()
                ->addMinutes($this->estimated_duration_minutes ?? 60)
                ->toIso8601String(),
            'is_editable' => $this->isEditable(),
            'is_cancellable' => $this->isCancellable(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
