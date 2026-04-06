<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListServiceSchedules extends ListRecords
{
    protected static string $resource = ServiceScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            ListServiceSchedules\Widgets\ScheduleStatsWidget::class,
        ];
    }
}
