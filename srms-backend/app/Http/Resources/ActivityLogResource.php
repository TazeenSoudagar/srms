<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
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
            'action' => $this->action,
            'loggable_type' => $this->loggable_type,
            'loggable_id' => $hashidsService->encode($this->loggable_id),
            'details' => $this->details,
            'user' => [
                'id' => $hashidsService->encode($this->user->id),
                'name' => $this->user->first_name . ' ' . $this->user->last_name,
                'email' => $this->user->email,
                'role' => $this->user->role->name ?? null,
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
