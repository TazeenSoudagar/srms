<?php

namespace App\Filament\Resources\ActivityLog\Schemas;

use App\Filament\Resources\Users\UserResource;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ActivityLogInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Activity Information')
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('User')
                            ->url(fn ($record) => $record->user
                                ? UserResource::getUrl('view', ['record' => $record->user])
                                : null)
                            ->color('primary')
                            ->weight('bold'),
                        TextEntry::make('user.role.name')
                            ->label('User Role')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'Admin' => 'danger',
                                'Support Engineer' => 'warning',
                                'Client' => 'success',
                                default => 'gray',
                            }),
                        TextEntry::make('action')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'created' => 'success',
                                'updated' => 'info',
                                'deleted' => 'danger',
                                'restored' => 'warning',
                                default => 'gray',
                            }),
                        TextEntry::make('loggable_type')
                            ->label('Model Type')
                            ->formatStateUsing(fn ($state) => class_basename($state))
                            ->badge()
                            ->color('primary'),
                        TextEntry::make('loggable_id')
                            ->label('Model ID'),
                        TextEntry::make('created_at')
                            ->label('Timestamp')
                            ->dateTime('F j, Y g:i A'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Details')
                    ->schema([
                        TextEntry::make('details')
                            ->label('Activity Details (JSON)')
                            ->formatStateUsing(fn ($state) => json_encode($state, JSON_PRETTY_PRINT))
                            ->columnSpanFull()
                            ->copyable()
                            ->placeholder('No details')
                            ->extraAttributes(['class' => 'font-mono text-sm'])
                            ->html(false),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
