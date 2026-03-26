<?php

namespace App\Filament\Resources\Service\Pages;

use App\Filament\Resources\Service\ServiceResource;
use App\Models\Media;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Storage;

class CreateService extends CreateRecord
{
    protected static string $resource = ServiceResource::class;

    /**
     * Handle the creation of the service and its media.
     */
    protected function afterCreate(): void
    {
        $data = $this->form->getState();

        // Handle service image upload
        if (isset($data['service_image']) && $data['service_image']) {
            $this->createMediaRecord($data['service_image']);
        }
    }

    /**
     * Create media record for the uploaded service image.
     */
    protected function createMediaRecord(string $filePath): void
    {
        $filename = basename($filePath);
        $url = Storage::disk('public')->url($filePath);

        Media::create([
            'name' => $filename,
            'url' => $url,
            'path' => $filePath,
            'mediaable_id' => $this->record->id,
            'mediaable_type' => get_class($this->record),
        ]);
    }
}
