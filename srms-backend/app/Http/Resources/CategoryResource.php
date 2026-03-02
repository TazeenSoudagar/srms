<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashidsService = app(\App\Services\HashidsService::class);

        return [
            'id' => $hashidsService->encode($this->id),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'displayOrder' => $this->display_order,
            'isActive' => (bool) $this->is_active,
            'serviceCount' => $this->when(
                $this->relationLoaded('services'),
                fn () => $this->services->count()
            ),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
