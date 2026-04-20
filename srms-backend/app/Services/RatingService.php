<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EngineerRatingAggregate;
use App\Models\Rating;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RatingService
{
    /**
     * Create a rating for a completed service request.
     */
    public function createRating(ServiceRequest $serviceRequest, array $data): Rating
    {
        return DB::transaction(function () use ($serviceRequest, $data) {
            $engineerId = $serviceRequest->schedules()->latest()->first()?->engineer_id;

            $rating = Rating::create([
                'service_request_id' => $serviceRequest->id,
                'user_id' => $data['user_id'],
                'engineer_id' => $engineerId,
                'service_id' => $serviceRequest->service_id,
                'rating' => $data['rating'],
                'professionalism_rating' => $data['professionalism_rating'] ?? null,
                'timeliness_rating' => $data['timeliness_rating'] ?? null,
                'quality_rating' => $data['quality_rating'] ?? null,
                'review' => $data['review'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
            ]);

            // Update engineer aggregate
            if ($engineerId) {
                $engineer = User::find($engineerId);
                if ($engineer) {
                    $this->updateEngineerAggregate($engineer);
                }
            }

            return $rating;
        });
    }

    /**
     * Update engineer rating aggregate.
     */
    public function updateEngineerAggregate(User $engineer): void
    {
        $ratings = Rating::where('engineer_id', $engineer->id)->get();

        if ($ratings->isEmpty()) {
            return;
        }

        $aggregate = EngineerRatingAggregate::firstOrNew(['engineer_id' => $engineer->id]);

        // Calculate averages
        $aggregate->average_rating = round($ratings->avg('rating'), 2);
        $aggregate->total_ratings = $ratings->count();

        // Calculate breakdown averages
        $aggregate->average_professionalism = round($ratings->whereNotNull('professionalism_rating')->avg('professionalism_rating'), 2);
        $aggregate->average_timeliness = round($ratings->whereNotNull('timeliness_rating')->avg('timeliness_rating'), 2);
        $aggregate->average_quality = round($ratings->whereNotNull('quality_rating')->avg('quality_rating'), 2);

        // Calculate rating distribution
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[(string) $i] = $ratings->where('rating', $i)->count();
        }
        $aggregate->rating_distribution = $distribution;

        $aggregate->last_calculated_at = now();
        $aggregate->save();
    }

    /**
     * Get engineer rating summary.
     */
    public function getEngineerRatingSummary(User $engineer): array
    {
        $aggregate = $engineer->ratingAggregate;

        if (! $aggregate) {
            return [
                'average_rating' => 0,
                'total_ratings' => 0,
                'rating_distribution' => ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0],
                'breakdown' => [
                    'professionalism' => null,
                    'timeliness' => null,
                    'quality' => null,
                ],
            ];
        }

        return [
            'average_rating' => (float) $aggregate->average_rating,
            'total_ratings' => $aggregate->total_ratings,
            'rating_distribution' => $aggregate->rating_distribution ?? ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0],
            'breakdown' => [
                'professionalism' => $aggregate->average_professionalism ? (float) $aggregate->average_professionalism : null,
                'timeliness' => $aggregate->average_timeliness ? (float) $aggregate->average_timeliness : null,
                'quality' => $aggregate->average_quality ? (float) $aggregate->average_quality : null,
            ],
        ];
    }

    /**
     * Check if user can rate a service request.
     */
    public function canRate(User $user, ServiceRequest $serviceRequest): bool
    {
        // Must be the customer who made the request
        if ($serviceRequest->created_by !== $user->id) {
            return false;
        }

        // Service request must be completed/closed
        $statusValue = $serviceRequest->status instanceof \BackedEnum
            ? $serviceRequest->status->value
            : (string) $serviceRequest->status;

        if ($statusValue !== 'closed') {
            return false;
        }

        // Cannot rate if already rated
        if (Rating::where('service_request_id', $serviceRequest->id)
            ->where('user_id', $user->id)
            ->exists()) {
            return false;
        }

        return true;
    }
}
