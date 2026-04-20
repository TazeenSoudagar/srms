<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\Concerns\HandlesSchedulePricing;
use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditServiceSchedule extends EditRecord
{
    use HandlesSchedulePricing;

    protected static string $resource = ServiceScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return static::applyPricingMutation($data, fn () => $this->halt());
    }
}
