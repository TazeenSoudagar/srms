<?php

namespace App\Filament\Resources\ServiceRequest\Pages;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditServiceRequest extends EditRecord
{
    protected static string $resource = ServiceRequestResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['updated_by'] = auth()->id();

        // If status is closed, set closed_at
        if (($data['status'] ?? $this->record->status) === 'closed' && ! $this->record->closed_at) {
            $data['closed_at'] = now();
        }

        // If reopening, clear closed_at
        if (($data['status'] ?? $this->record->status) !== 'closed' && $this->record->closed_at) {
            $data['closed_at'] = null;
        }

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
