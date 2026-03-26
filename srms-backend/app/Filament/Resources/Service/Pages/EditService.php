<?php

namespace App\Filament\Resources\Service\Pages;

use App\Filament\Resources\Service\ServiceResource;
use App\Models\Media;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;

class EditService extends EditRecord
{
    protected static string $resource = ServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    /**
     * Mutate form data before filling the form.
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Load existing media image if available
        $existingMedia = $this->record->media()->first();
        if ($existingMedia) {
            // Use the stored path field directly instead of extracting from URL
            $data['service_image'] = $existingMedia->path;
        }

        return $data;
    }

    /**
     * Handle the update of the service and its media.
     */
    protected function afterSave(): void
    {
        $data = $this->form->getState();

        // Get existing media
        $existingMedia = $this->record->media()->first();

        // Handle service image upload/update
        if (isset($data['service_image']) && $data['service_image']) {
            // Check if image has changed
            $newFilePath = $data['service_image'];

            if ($existingMedia) {
                // Use the stored path field directly
                $oldFilePath = $existingMedia->path;

                // If file has changed, delete old file and update media record
                if ($oldFilePath !== $newFilePath) {
                    // Delete old file (only if path exists)
                    if ($oldFilePath) {
                        Storage::disk('public')->delete($oldFilePath);
                    }

                    // Update media record
                    $filename = basename($newFilePath);
                    $url = Storage::disk('public')->url($newFilePath);

                    $existingMedia->update([
                        'name' => $filename,
                        'url' => $url,
                        'path' => $newFilePath,
                    ]);
                }
            } else {
                // Create new media record if none exists
                $this->createMediaRecord($newFilePath);
            }
        } elseif ($existingMedia && (! isset($data['service_image']) || ! $data['service_image'])) {
            // Image was removed, delete file and media record
            // Use the stored path field directly
            $oldFilePath = $existingMedia->path;
            if ($oldFilePath) {
                Storage::disk('public')->delete($oldFilePath);
            }
            $existingMedia->delete();
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
