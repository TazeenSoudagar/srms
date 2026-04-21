<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\Media;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    /** @var array<string> */
    private array $engineerDocumentPaths = [];

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Pre-populate engineer_documents field with existing document paths
        $data['engineer_documents'] = $this->record->documents()->pluck('path')->toArray();

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (isset($data['password']) && filled($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $this->engineerDocumentPaths = $data['engineer_documents'] ?? [];
        unset($data['engineer_documents']);

        return $data;
    }

    protected function afterSave(): void
    {
        $this->syncEngineerDocuments($this->engineerDocumentPaths);
    }

    /** @param array<string> $newPaths */
    private function syncEngineerDocuments(array $newPaths): void
    {
        $existing = $this->record->documents()->pluck('path')->toArray();
        $toDelete = array_diff($existing, $newPaths);
        $toAdd = array_diff($newPaths, $existing);

        // Remove documents that were removed in the form
        if ($toDelete) {
            $this->record->documents()->whereIn('path', $toDelete)->delete();
        }

        // Add new documents
        foreach ($toAdd as $path) {
            $url = Storage::disk('public')->url($path);
            Media::create([
                'name' => basename($path),
                'url' => $url,
                'path' => $path,
                'mediaable_id' => $this->record->id,
                'mediaable_type' => \App\Models\User::class,
                'collection' => 'documents',
                'mime_type' => Storage::disk('public')->mimeType($path) ?: null,
            ]);
        }
    }
}
