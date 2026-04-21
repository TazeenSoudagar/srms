<?php

namespace App\Filament\Resources\Complaint\Schemas;

use App\Enums\ComplaintStatus;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ComplaintInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Complaint Details')
                    ->schema([
                        TextEntry::make('complaint_number')
                            ->label('Complaint #')
                            ->weight('bold')
                            ->copyable(),
                        TextEntry::make('status')
                            ->badge()
                            ->formatStateUsing(fn ($state) => ComplaintStatus::getLabel($state->value ?? $state))
                            ->color(fn ($state): string => match ($state->value ?? $state) {
                                'pending' => 'danger',
                                'in_progress' => 'warning',
                                'closed' => 'success',
                                default => 'gray',
                            }),
                        TextEntry::make('created_at')
                            ->label('Raised At')
                            ->dateTime('F j, Y g:i A'),
                        TextEntry::make('closed_at')
                            ->label('Closed At')
                            ->dateTime('F j, Y g:i A')
                            ->placeholder('Not closed yet'),
                        TextEntry::make('description')
                            ->columnSpanFull()
                            ->prose(),
                        TextEntry::make('admin_note')
                            ->label('Admin Note')
                            ->columnSpanFull()
                            ->placeholder('No admin note')
                            ->prose(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Related Information')
                    ->schema([
                        TextEntry::make('serviceRequest.request_number')
                            ->label('Service Request #')
                            ->color('primary')
                            ->weight('bold'),
                        TextEntry::make('serviceRequest.title')
                            ->label('Service Request Title'),
                        TextEntry::make('serviceRequest.status')
                            ->label('Service Request Status')
                            ->badge()
                            ->formatStateUsing(fn ($state) => ucfirst(str_replace('_', ' ', $state->value ?? $state))
                            ),
                        TextEntry::make('createdBy.name')
                            ->label('Raised By (Customer)'),
                        TextEntry::make('createdBy.email')
                            ->label('Customer Email')
                            ->copyable(),
                        TextEntry::make('assignedEngineer.name')
                            ->label('Assigned Engineer')
                            ->placeholder('Unassigned'),
                        TextEntry::make('assignedEngineer.email')
                            ->label('Engineer Email')
                            ->copyable()
                            ->placeholder('—'),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Attached Images')
                    ->schema([
                        TextEntry::make('media')
                            ->label('')
                            ->formatStateUsing(fn ($record) => $record->media->count() . ' image(s) attached')
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
