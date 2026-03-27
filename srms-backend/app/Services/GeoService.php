<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class GeoService
{
    /**
     * Calculate distance between two points using Haversine formula.
     * Returns distance in kilometers.
     */
    public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $latDiff = deg2rad($lat2 - $lat1);
        $lngDiff = deg2rad($lng2 - $lng1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Find nearby engineers within a given radius.
     */
    public function findNearbyEngineers(float $lat, float $lng, int $radiusKm = 50): Collection
    {
        // Get all engineers with location data
        $engineers = User::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereHas('role', function ($query) {
                $query->where('name', 'Support Engineer');
            })
            ->where('is_active', true)
            ->get();

        // Calculate distance for each engineer and filter
        return $engineers->map(function ($engineer) use ($lat, $lng) {
            $distance = $this->calculateDistance(
                $lat,
                $lng,
                $engineer->latitude,
                $engineer->longitude
            );

            $engineer->distance = $distance;

            return $engineer;
        })
            ->filter(function ($engineer) use ($radiusKm) {
                return $engineer->distance <= $radiusKm;
            })
            ->sortBy('distance')
            ->values();
    }
}
