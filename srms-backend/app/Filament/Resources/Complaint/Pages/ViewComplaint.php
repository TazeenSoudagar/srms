<?php

namespace App\Filament\Resources\Complaint\Pages;

use App\Filament\Resources\Complaint\ComplaintResource;
use App\Models\Complaint;
use App\Models\User;
use App\Notifications\ComplaintAssigned;
use App\Notifications\ComplaintClosed;
use App\Services\ActivityLogService;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification as LaravelNotification;

class ViewComplaint extends ViewRecord
{
    protected static string $resource = ComplaintResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()
                ->label('Update Status / Assign Engineer')
                ->visible(fn () => in_array(
                    $this->record->status?->value ?? $this->record->status,
                    ['pending', 'in_progress']
                )),

            Action::make('admin_close')
                ->label('Close with Note')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => ($this->record->status?->value ?? $this->record->status) !== 'closed')
                ->form([
                    \Filament\Forms\Components\Textarea::make('admin_note')
                        ->label('Closing Note')
                        ->required()
                        ->minLength(5)
                        ->rows(4)
                        ->placeholder('Explain why this complaint is being closed...'),
                ])
                ->action(function (array $data) {
                    /** @var Complaint $complaint */
                    $complaint = $this->record;
                    $actor = Auth::user();

                    $complaint->update([
                        'status' => 'closed',
                        'admin_note' => $data['admin_note'],
                        'closed_at' => now(),
                    ]);

                    ActivityLogService::logClosed($actor, $complaint, [
                        'closed_by' => 'admin',
                        'admin_note' => $data['admin_note'],
                    ]);

                    $customer = User::find($complaint->created_by);
                    $customer?->notify(new ComplaintClosed($complaint, 'admin'));

                    Notification::make()
                        ->title('Complaint closed successfully.')
                        ->success()
                        ->send();

                    $this->refreshFormData(['status', 'admin_note', 'closed_at']);
                })
                ->requiresConfirmation()
                ->modalHeading('Close Complaint with Note')
                ->modalDescription('The customer will be notified with your note.'),

            Action::make('assign_and_progress')
                ->label('Mark In Progress & Assign')
                ->icon('heroicon-o-user-plus')
                ->color('warning')
                ->visible(fn () => ($this->record->status?->value ?? $this->record->status) === 'pending')
                ->form([
                    \Filament\Forms\Components\Select::make('assigned_engineer_id')
                        ->label('Assign Engineer')
                        ->relationship('assignedEngineer', 'first_name')
                        ->getOptionLabelFromRecordUsing(
                            fn ($record) => $record->first_name . ' ' . $record->last_name
                        )
                        ->searchable()
                        ->preload()
                        ->required(),
                ])
                ->action(function (array $data) {
                    /** @var Complaint $complaint */
                    $complaint = $this->record;
                    $actor = Auth::user();

                    $complaint->update([
                        'status' => 'in_progress',
                        'assigned_engineer_id' => $data['assigned_engineer_id'],
                    ]);

                    ActivityLogService::logUpdated($actor, $complaint, [
                        'status' => 'in_progress',
                        'assigned_engineer_id' => $data['assigned_engineer_id'],
                    ]);

                    $complaint->load('assignedEngineer');
                    $complaint->assignedEngineer?->notify(new ComplaintAssigned($complaint));

                    Notification::make()
                        ->title('Engineer assigned and complaint marked in progress.')
                        ->success()
                        ->send();

                    $this->refreshFormData(['status', 'assigned_engineer_id']);
                }),
        ];
    }
}
