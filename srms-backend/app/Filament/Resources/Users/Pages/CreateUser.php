<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Jobs\User\SendWelcomeEmailJob;
use App\Models\Media;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    private ?string $plainPassword = null;

    /** @var array<string> */
    private array $engineerDocumentPaths = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->plainPassword = Str::random(16);
        $data['password'] = Hash::make($this->plainPassword);

        $this->engineerDocumentPaths = $data['engineer_documents'] ?? [];
        unset($data['engineer_documents']);

        return $data;
    }

    protected function afterCreate(): void
    {
        if ($this->plainPassword) {
            SendWelcomeEmailJob::dispatch($this->record, $this->plainPassword);
        }

        $this->syncEngineerDocuments($this->engineerDocumentPaths);
    }

    /** @param array<string> $paths */
    private function syncEngineerDocuments(array $paths): void
    {
        foreach ($paths as $path) {
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
