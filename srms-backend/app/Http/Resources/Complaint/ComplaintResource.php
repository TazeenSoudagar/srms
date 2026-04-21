<?php

declare(strict_types=1);

namespace App\Http\Resources\Complaint;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hashids = app(HashidsService::class);

        return [
            'id' => $hashids->encode($this->id),
            'complaint_number' => $this->complaint_number,
            'status' => $this->status?->value ?? $this->status,
            'description' => $this->description,
            'admin_note' => $this->admin_note,
            'closed_at' => $this->closed_at?->toISOString(),
            'service_request' => $this->when($this->relationLoaded('serviceRequest'), fn () => [
                'id' => $hashids->encode($this->serviceRequest->id),
                'request_number' => $this->serviceRequest->request_number,
                'title' => $this->serviceRequest->title,
                'status' => $this->serviceRequest->status?->value ?? $this->serviceRequest->status,
            ]),
            'created_by' => $this->when($this->relationLoaded('createdBy'), fn () => [
                'id' => $hashids->encode($this->createdBy->id),
                'first_name' => $this->createdBy->first_name,
                'last_name' => $this->createdBy->last_name,
                'email' => $this->createdBy->email,
            ]),
            'assigned_engineer' => $this->when(
                $this->relationLoaded('assignedEngineer') && $this->assignedEngineer,
                fn () => [
                    'id' => $hashids->encode($this->assignedEngineer->id),
                    'first_name' => $this->assignedEngineer->first_name,
                    'last_name' => $this->assignedEngineer->last_name,
                    'email' => $this->assignedEngineer->email,
                ]
            ),
            'media' => $this->when($this->relationLoaded('media'), fn () => $this->media->map(fn ($m) => [
                'id' => $hashids->encode($m->id),
                'name' => $m->name,
                'url' => str_starts_with($m->url, 'http') ? $m->url : asset($m->url),
            ])->values()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
