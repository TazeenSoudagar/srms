<?php

namespace App\Filament\Resources\ContactEnquiry\Pages;

use App\Filament\Resources\ContactEnquiry\ContactEnquiryResource;
use App\Models\ContactEnquiry;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewContactEnquiry extends ViewRecord
{
    protected static string $resource = ContactEnquiryResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);

        // Auto-mark as read when opened
        /** @var ContactEnquiry $enquiry */
        $enquiry = $this->record;
        if ($enquiry->status === 'new') {
            $enquiry->update(['status' => 'read']);
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('mark_replied')
                ->label('Mark as Replied')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => $this->record->status !== 'replied')
                ->form([
                    \Filament\Forms\Components\Textarea::make('admin_note')
                        ->label('Reply / Internal Note')
                        ->rows(4)
                        ->placeholder('Optionally record how this was handled or what was replied...'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status'     => 'replied',
                        'admin_note' => $data['admin_note'] ?: $this->record->admin_note,
                    ]);

                    Notification::make()
                        ->title('Enquiry marked as replied.')
                        ->success()
                        ->send();

                    $this->refreshFormData(['status', 'admin_note']);
                })
                ->requiresConfirmation(false),

            Action::make('mark_new')
                ->label('Mark as New')
                ->icon('heroicon-o-arrow-uturn-left')
                ->color('gray')
                ->visible(fn () => $this->record->status !== 'new')
                ->action(function () {
                    $this->record->update(['status' => 'new']);

                    Notification::make()
                        ->title('Enquiry marked as new.')
                        ->success()
                        ->send();

                    $this->refreshFormData(['status']);
                }),
        ];
    }
}
