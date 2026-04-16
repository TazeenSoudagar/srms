<?php

declare(strict_types=1);

namespace App\Jobs\Analytics;

use App\Enums\RequestStatus;
use App\Models\Service;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateServicePopularityJob implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Execute the job.
     *
     * Popularity score formula:
     *   - Each view contributes 0.1 points
     *   - Each completed (closed) service request contributes 5 points
     *
     * The top 10 services by score are flagged as trending.
     */
    public function handle(): void
    {
        $services = Service::withCount([
            'serviceRequests as completed_requests_count' => function ($query): void {
                $query->where('status', RequestStatus::Closed->value);
            },
        ])->get();

        foreach ($services as $service) {
            $score = (int) round(
                ($service->view_count * 0.1) + ($service->completed_requests_count * 5)
            );

            $service->popularity_score = $score;
            $service->saveQuietly();
        }

        // Mark top 10 as trending, clear the rest
        $topIds = $services
            ->sortByDesc('popularity_score')
            ->take(10)
            ->pluck('id');

        Service::query()->whereIn('id', $topIds)->update(['is_trending' => true]);
        Service::query()->whereNotIn('id', $topIds)->update(['is_trending' => false]);

        Log::info('UpdateServicePopularityJob completed', [
            'services_updated' => $services->count(),
            'trending_ids' => $topIds->values()->toArray(),
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Exception $exception): void
    {
        Log::error('UpdateServicePopularityJob failed', [
            'exception' => $exception?->getMessage(),
        ]);
    }
}
