<?php

namespace App\Filament\Resources\ServiceRequest\Pages;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\ServiceRequest;
use Filament\Resources\Pages\CreateRecord;

class CreateServiceRequest extends CreateRecord
{
    protected static string $resource = ServiceRequestResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['request_number'] = ServiceRequest::generateRequestNumber();
        $data['created_by'] = auth()->id();
        $data['status'] = $data['status'] ?? 'open';
        $data['priority'] = $data['priority'] ?? 'low';
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
