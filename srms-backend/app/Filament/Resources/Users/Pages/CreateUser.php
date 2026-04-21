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

    /** @var array<string, mixed> */
    private array $engineerProfileData = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->plainPassword = Str::random(16);
        $data['password'] = Hash::make($this->plainPassword);

        $this->engineerDocumentPaths = $data['engineer_documents'] ?? [];
        unset($data['engineer_documents']);

        $profileKeys = ['bio', 'hourly_rate', 'years_of_experience', 'specializations', 'availability_status'];
        foreach ($profileKeys as $key) {
            if (array_key_exists($key, $data)) {
                $this->engineerProfileData[$key] = $data[$key];
                unset($data[$key]);
            }
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        if ($this->plainPassword) {
            SendWelcomeEmailJob::dispatch($this->record, $this->plainPassword);
        }

        $this->syncEngineerDocuments($this->engineerDocumentPaths);

        if ($this->engineerProfileData) {
            $this->record->engineerProfile()->updateOrCreate([], $this->engineerProfileData);
        }
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
