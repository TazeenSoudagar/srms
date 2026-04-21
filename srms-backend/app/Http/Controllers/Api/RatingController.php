<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\ServiceRequest;
use App\Notifications\RatingSubmitted;
use App\Services\RatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    public function __construct(
        private readonly RatingService $ratingService,
    ) {}

    /**
     * Submit a rating for a completed service request.
     */
    public function store(StoreRatingRequest $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $user = Auth::user();

        if (! $this->ratingService->canRate($user, $serviceRequest)) {
            // Distinguish between already-rated and other conditions for a clear error message.
            if ($serviceRequest->created_by !== $user->id) {
                return response()->json([
                    'message' => 'You are not authorised to rate this service request.',
                ], 403);
            }

            $statusValue = $serviceRequest->status?->value ?? $serviceRequest->status;

            if ($statusValue !== 'closed') {
                return response()->json([
                    'message' => 'You can only rate a service request after it has been closed.',
                ], 422);
            }

            return response()->json([
                'message' => 'You have already submitted a rating for this service request.',
            ], 422);
        }

        // Ensure an engineer was assigned via a schedule before allowing a rating.
        $engineerId = $serviceRequest->schedules()->latest()->value('engineer_id');

        if (! $engineerId) {
            return response()->json([
                'message' => 'Cannot rate a request without an assigned engineer.',
            ], 422);
        }

        $rating = $this->ratingService->createRating($serviceRequest, [
            'user_id' => $user->id,
            'rating' => $request->rating,
            'review' => $request->review,
            'professionalism_rating' => $request->professionalism_rating,
            'timeliness_rating' => $request->timeliness_rating,
            'quality_rating' => $request->quality_rating,
        ]);

        $rating->load('user');

        // Notify the engineer about the new rating.
        $engineer = $rating->engineer;
        $engineer?->notify(new RatingSubmitted($rating));

        return (new RatingResource($rating))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Retrieve the rating for a service request (if one exists).
     */
    public function show(ServiceRequest $serviceRequest): JsonResponse
    {
        $user = Auth::user();

        // Scope the lookup to requests the authenticated user can access.
        $accessible = ServiceRequest::forUser($user)->where('id', $serviceRequest->id)->exists();

        if (! $accessible) {
            return response()->json(['message' => 'Service request not found.'], 404);
        }

        $rating = $serviceRequest->ratings()->with('user')->latest()->first();

        if (! $rating) {
            return response()->json(['message' => 'No rating found for this service request.'], 404);
        }

        return (new RatingResource($rating))->response();
    }
}
