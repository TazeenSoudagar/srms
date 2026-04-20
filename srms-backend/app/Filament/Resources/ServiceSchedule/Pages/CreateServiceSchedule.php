<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\Concerns\HandlesSchedulePricing;
use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use Filament\Resources\Pages\CreateRecord;

class CreateServiceSchedule extends CreateRecord
{
    use HandlesSchedulePricing;

    protected static string $resource = ServiceScheduleResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return static::applyPricingMutation($data, fn () => $this->halt());
    }
}
