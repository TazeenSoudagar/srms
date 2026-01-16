<?php

declare(strict_types=1);

namespace App\Http\Resources\ServiceRequest;

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
            'status' => $this->status?->value ?? $this->status,
            'priority' => $this->priority?->value ?? $this->priority,
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
            'updated_by' => new UserResource($this->whenLoaded('updatedBy')),
            'due_date' => $this->due_date?->toDateString(),
            'closed_at' => $this->closed_at?->toISOString(),
            'is_active' => $this->is_active,
            'comments_count' => $this->when(isset($this->comments_count), $this->comments_count),
            'media_count' => $this->when(isset($this->media_count), $this->media_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
