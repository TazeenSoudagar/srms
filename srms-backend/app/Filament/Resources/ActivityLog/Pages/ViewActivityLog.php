<?php

namespace App\Filament\Resources\ActivityLog\Pages;

use App\Filament\Resources\ActivityLog\ActivityLogResource;
use Filament\Resources\Pages\ViewRecord;

class ViewActivityLog extends ViewRecord
{
    protected static string $resource = ActivityLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No edit or delete actions - read-only
        ];
    }
}
