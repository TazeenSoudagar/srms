<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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

        // Get the first media image URL, always resolved via Storage to use APP_URL
        $imageUrl = null;
        if ($this->relationLoaded('media')) {
            $firstMedia = $this->media->first();
            if ($firstMedia) {
                if ($firstMedia->path) {
                    // Use Storage to generate URL from path — always resolves via APP_URL
                    $imageUrl = Storage::disk('public')->url($firstMedia->path);
                } elseif ($firstMedia->url) {
                    // Legacy records with no path: extract the relative path from the stored URL
                    // and regenerate via Storage so it uses the correct APP_URL
                    $storagePath = parse_url($firstMedia->url, PHP_URL_PATH);
                    $relativePath = $storagePath
                        ? ltrim(str_replace('/storage/', '', $storagePath), '/')
                        : null;
                    $imageUrl = $relativePath
                        ? Storage::disk('public')->url($relativePath)
                        : null;
                }
            }
        }

        return [
            'id' => $hashidsService->encode($this->id),
            'name' => $this->name,
            'description' => $this->description,
            'basePrice' => $this->base_price ? (float) $this->base_price : null,
            'averageDuration' => $this->average_duration_minutes,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'rating' => $this->average_rating ?? null,
            'reviewCount' => $this->reviews_count ?? 0,
            'isTrending' => (bool) $this->is_trending,
            'isPopular' => (bool) $this->is_popular,
            'popularityScore' => $this->popularity_score,
            'viewCount' => $this->view_count,
            'icon' => $this->icon,
            'image' => $imageUrl,
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
