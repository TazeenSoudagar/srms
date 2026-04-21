<?php

namespace App\Filament\Resources\ServiceRequest\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section as ComponentsSection;
use Filament\Schemas\Schema;

class ServiceRequestInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                ComponentsSection::make('Request Details')
                    ->schema([
                        TextEntry::make('request_number'),
                        TextEntry::make('service.name')
                            ->label('Service'),
                        TextEntry::make('title'),
                        TextEntry::make('description')
                            ->columnSpanFull(),
                        TextEntry::make('status')
                            ->badge(),
                        TextEntry::make('priority')
                            ->badge(),
                        TextEntry::make('due_date')
                            ->date(),
                        IconEntry::make('is_active')
                            ->boolean(),
                    ])
                    ->columns(2),
                ComponentsSection::make('Assignment')
                    ->schema([
                        TextEntry::make('createdBy.first_name')
                            ->label('Created By')
                            ->formatStateUsing(fn ($record) => $record->createdBy ? $record->createdBy->first_name.' '.$record->createdBy->last_name.' ('.$record->createdBy->email.')' : '-'),
                        TextEntry::make('schedules.engineer.first_name')
                            ->label('Assigned Engineers')
                            ->formatStateUsing(fn ($record) => $record->schedules->pluck('engineer')->unique('id')->map(fn($eng) => $eng ? $eng->first_name.' '.$eng->last_name.' ('.$eng->email.')' : 'Unknown')->join(', ') ?: 'Not scheduled yet')
                            ->badge()
                            ->color(fn ($record) => $record->schedules->count() > 0 ? 'success' : 'warning'),
                        TextEntry::make('updatedBy.first_name')
                            ->label('Last Updated By')
                            ->formatStateUsing(fn ($record) => $record->updatedBy ? $record->updatedBy->first_name.' '.$record->updatedBy->last_name : '-'),
                    ])
                    ->columns(3),
                ComponentsSection::make('Timestamps')
                    ->schema([
                        TextEntry::make('created_at')
                            ->dateTime(),
                        TextEntry::make('updated_at')
                            ->dateTime(),
                        TextEntry::make('closed_at')
                            ->dateTime()
                            ->placeholder('Not closed'),
                    ])
                    ->columns(3),
            ]);
    }
}
