<?php

namespace App\Filament\Resources\Rating\Pages\ListRatings\Widgets;

use App\Models\Rating;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class RatingStatsWidget extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $totalRatings = Rating::count();
        $averageRating = Rating::avg('rating');

        // Calculate rating distribution
        $fiveStars = Rating::where('rating', 5)->count();
        $fourStars = Rating::where('rating', 4)->count();
        $threeStars = Rating::where('rating', 3)->count();
        $twoStars = Rating::where('rating', 2)->count();
        $oneStar = Rating::where('rating', 1)->count();

        return [
            Stat::make('Total Ratings', $totalRatings)
                ->description('All time ratings')
                ->icon('heroicon-o-star')
                ->color('success'),

            Stat::make('Average Rating', number_format($averageRating, 2))
                ->description(str_repeat('⭐', (int) round($averageRating)))
                ->icon('heroicon-o-chart-bar')
                ->color('warning'),

            Stat::make('5-Star Ratings', $fiveStars)
                ->description(sprintf('%.1f%% of total', $totalRatings > 0 ? ($fiveStars / $totalRatings * 100) : 0))
                ->icon('heroicon-o-star')
                ->color('success'),

            Stat::make('4-Star Ratings', $fourStars)
                ->description(sprintf('%.1f%% of total', $totalRatings > 0 ? ($fourStars / $totalRatings * 100) : 0))
                ->icon('heroicon-o-star')
                ->color('info'),

            Stat::make('3-Star Ratings', $threeStars)
                ->description(sprintf('%.1f%% of total', $totalRatings > 0 ? ($threeStars / $totalRatings * 100) : 0))
                ->icon('heroicon-o-star')
                ->color('warning'),

            Stat::make('Low Ratings (1-2 stars)', $oneStar + $twoStars)
                ->description(sprintf('%.1f%% of total', $totalRatings > 0 ? (($oneStar + $twoStars) / $totalRatings * 100) : 0))
                ->icon('heroicon-o-exclamation-triangle')
                ->color('danger'),
        ];
    }
}
