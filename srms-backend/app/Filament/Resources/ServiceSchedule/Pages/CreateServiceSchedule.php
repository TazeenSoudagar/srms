<?php

namespace App\Filament\Resources\ServiceSchedule\Pages;

use App\Filament\Resources\ServiceSchedule\Concerns\HandlesSchedulePricing;
use App\Filament\Resources\ServiceSchedule\ServiceScheduleResource;
use App\Models\User;
use App\Notifications\EngineerAssigned;
use App\Notifications\ScheduleCreated;
use Filament\Resources\Pages\CreateRecord;

class CreateServiceSchedule extends CreateRecord
{
    use HandlesSchedulePricing;

    protected static string $resource = ServiceScheduleResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return static::applyPricingMutation($data, fn () => $this->halt());
    }

    protected function afterCreate(): void
    {
        $schedule = $this->record;
        $schedule->load(['serviceRequest', 'engineer', 'customer']);

        // Notify engineer
        if ($schedule->engineer) {
            $schedule->engineer->notify(new EngineerAssigned($schedule));
        }

        // Notify customer
        $customer = $schedule->customer ?? User::find($schedule->customer_id);
        if ($customer) {
            $customer->notify(new ScheduleCreated($schedule));
        }
    }
}
