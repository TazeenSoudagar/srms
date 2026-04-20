<?php

declare(strict_types=1);

namespace App\Http\Resources\ServiceRequest;

use App\Http\Resources\CommentResource;
use App\Http\Resources\RatingResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\UserResource;
use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashidsService = app(HashidsService::class);

        return [
            'id' => $hashidsService->encode($this->id),
            'request_number' => $this->request_number,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'title' => $this->title,
            'description' => $this->description,
            'preferred_time_slot' => $this->preferred_time_slot?->toISOString(),
            'service_location' => $this->service_location,
            'status' => $this->status?->value ?? $this->status,
            'priority' => $this->priority?->value ?? $this->priority,
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
            'updated_by' => new UserResource($this->whenLoaded('updatedBy')),
            'schedules' => $this->when($this->relationLoaded('schedules'), function () use ($hashidsService) {
                return $this->schedules->map(function ($schedule) use ($hashidsService) {
                    return [
                        'id' => $hashidsService->encode($schedule->id),
                        'engineer' => $schedule->engineer ? [
                            'id' => $hashidsService->encode($schedule->engineer->id),
                            'first_name' => $schedule->engineer->first_name,
                            'last_name' => $schedule->engineer->last_name,
                            'email' => $schedule->engineer->email,
                        ] : null,
                        'scheduled_at' => $schedule->scheduled_at?->toISOString(),
                        'completed_at' => $schedule->completed_at?->toISOString(),
                        'status' => $schedule->status,
                        'actual_price' => $schedule->actual_price,
                        'gst_rate' => $schedule->gst_rate,
                        'gst_amount' => $schedule->gst_amount,
                        'total_amount' => $schedule->total_amount,
                        'payment_status' => $schedule->payment_status,
                        'payment_due_at' => $schedule->payment_due_at?->toISOString(),
                        'payment_uploaded_at' => $schedule->payment_uploaded_at?->toISOString(),
                        'payment_verified_at' => $schedule->payment_verified_at?->toISOString(),
                        'invoice' => $schedule->relationLoaded('invoice') && $schedule->invoice ? [
                            'invoice_number' => $schedule->invoice->invoice_number,
                            'sent_at' => $schedule->invoice->sent_at?->toISOString(),
                            'has_pdf' => $schedule->invoice->pdf_path !== null,
                        ] : null,
                    ];
                });
            }),
            'due_date' => $this->due_date?->toDateString(),
            'estimated_duration_minutes' => $this->service?->average_duration_minutes,
            'closed_at' => $this->closed_at?->toISOString(),
            'is_active' => $this->is_active,
            'rating' => $this->when(
                $this->ratings()->exists(),
                fn () => new RatingResource($this->ratings()->with('user')->latest()->first())
            ),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'comments_count' => $this->when(isset($this->comments_count), $this->comments_count),
            'media_count' => $this->when(isset($this->media_count), $this->media_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
