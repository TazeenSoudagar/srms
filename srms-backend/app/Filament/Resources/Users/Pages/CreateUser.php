<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Jobs\User\SendWelcomeEmailJob;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    private ?string $plainPassword = null;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Generate a random 16-character password
        $this->plainPassword = Str::random(16);
        $data['password'] = Hash::make($this->plainPassword);

        return $data;
    }

    protected function afterCreate(): void
    {
        // Dispatch job to send welcome email with credentials
        if ($this->plainPassword) {
            SendWelcomeEmailJob::dispatch($this->record, $this->plainPassword);
        }
    }
}
