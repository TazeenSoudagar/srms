<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditServiceSchedule extends EditRecord
{
    protected static string $resource = ServiceScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
