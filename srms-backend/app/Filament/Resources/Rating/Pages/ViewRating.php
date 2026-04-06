<?php

namespace App\Filament\Resources\Rating\Pages;

use App\Filament\Resources\Rating\RatingResource;
use Filament\Resources\Pages\ViewRecord;

class ViewRating extends ViewRecord
{
    protected static string $resource = RatingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No edit or delete actions
        ];
    }
}
