<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashidsService = app(HashidsService::class);

        $reviewerName = $this->is_anonymous
            ? 'Anonymous'
            : trim(($this->user?->first_name ?? '').' '.($this->user?->last_name ?? ''));

        $initials = $this->is_anonymous
            ? 'AN'
            : $this->getInitials($this->user?->first_name, $this->user?->last_name);

        return [
            'id' => $hashidsService->encode($this->id),
            'rating' => $this->rating,
            'review' => $this->review,
            'professionalism_rating' => $this->professionalism_rating,
            'timeliness_rating' => $this->timeliness_rating,
            'quality_rating' => $this->quality_rating,
            'is_anonymous' => $this->is_anonymous,
            'created_at' => $this->created_at?->toISOString(),
            'reviewer' => [
                'name' => $reviewerName ?: 'Anonymous',
                'initials' => $initials,
            ],
        ];
    }

    /**
     * Generate avatar initials from first and last name.
     */
    private function getInitials(?string $firstName, ?string $lastName): string
    {
        $first = mb_substr($firstName ?? '', 0, 1);
        $last = mb_substr($lastName ?? '', 0, 1);

        $initials = strtoupper($first.$last);

        return $initials ?: 'AN';
    }
}
