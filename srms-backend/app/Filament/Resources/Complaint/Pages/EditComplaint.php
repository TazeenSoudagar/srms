<?php

namespace App\Filament\Resources\Complaint\Pages;

use App\Filament\Resources\Complaint\ComplaintResource;
use App\Models\User;
use App\Notifications\ComplaintAssigned;
use App\Services\ActivityLogService;
use Filament\Actions\Action;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Auth;

class EditComplaint extends EditRecord
{
    protected static string $resource = ComplaintResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    protected function afterSave(): void
    {
        $complaint = $this->record;
        $actor = Auth::user();

        ActivityLogService::logUpdated($actor, $complaint, [
            'status' => $complaint->status?->value ?? $complaint->status,
            'assigned_engineer_id' => $complaint->assigned_engineer_id,
        ]);

        if ($complaint->assigned_engineer_id && $complaint->assignedEngineer) {
            $complaint->assignedEngineer->notify(new ComplaintAssigned($complaint));
        }
    }
}
