<?php

namespace App\Filament\Resources\Rating\Pages;

use App\Filament\Resources\Rating\RatingResource;
use App\Models\Rating;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Enums\IconSize;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ListRatings extends ListRecords
{
    protected static string $resource = RatingResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            ListRatings\Widgets\RatingStatsWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            // No create action - ratings are customer-only
        ];
    }
}
