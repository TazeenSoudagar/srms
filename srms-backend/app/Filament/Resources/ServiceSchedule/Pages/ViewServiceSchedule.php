<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewServiceSchedule extends ViewRecord
{
    protected static string $resource = ServiceScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
