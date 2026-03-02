<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'basePrice' => $this->base_price ? (float) $this->base_price : null,
            'averageDuration' => $this->average_duration_minutes,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'rating' => $this->average_rating ?? null,
            'reviewCount' => $this->reviews_count ?? 0,
            'isPopular' => (bool) $this->is_trending,
            'popularityScore' => $this->popularity_score,
            'viewCount' => $this->view_count,
            'icon' => $this->icon,
            'image' => $this->icon ? "/images/services/{$this->icon}.jpg" : null,
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
