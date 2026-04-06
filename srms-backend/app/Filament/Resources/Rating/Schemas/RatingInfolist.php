<?php

namespace App\Filament\Resources\Rating\Schemas;

use App\Filament\Resources\Service\ServiceResource;
use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Filament\Resources\Users\UserResource;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class RatingInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Rating Details')
                    ->schema([
                        TextEntry::make('serviceRequest.request_number')
                            ->label('Service Request')
                            ->url(fn ($record) => $record->serviceRequest
                                ? ServiceRequestResource::getUrl('view', ['record' => $record->serviceRequest])
                                : null)
                            ->color('primary')
                            ->weight('bold'),
                        TextEntry::make('user.name')
                            ->label('Customer')
                            ->url(fn ($record) => $record->user
                                ? UserResource::getUrl('view', ['record' => $record->user])
                                : null)
                            ->color('primary'),
                        TextEntry::make('engineer.name')
                            ->label('Engineer')
                            ->url(fn ($record) => $record->engineer
                                ? UserResource::getUrl('view', ['record' => $record->engineer])
                                : null)
                            ->color('primary'),
                        TextEntry::make('service.name')
                            ->label('Service')
                            ->url(fn ($record) => $record->service
                                ? ServiceResource::getUrl('view', ['record' => $record->service])
                                : null)
                            ->color('primary'),
                        IconEntry::make('is_anonymous')
                            ->label('Anonymous')
                            ->boolean()
                            ->trueIcon('heroicon-o-eye-slash')
                            ->falseIcon('heroicon-o-eye')
                            ->trueColor('warning')
                            ->falseColor('success'),
                        TextEntry::make('created_at')
                            ->label('Submitted At')
                            ->dateTime(),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Ratings')
                    ->schema([
                        TextEntry::make('rating')
                            ->label('Overall Rating')
                            ->formatStateUsing(fn ($state) => str_repeat('⭐', (int) $state) . " ({$state}/5)")
                            ->size('large')
                            ->color('warning')
                            ->weight('bold'),
                        TextEntry::make('professionalism_rating')
                            ->label('Professionalism')
                            ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'),
                        TextEntry::make('timeliness_rating')
                            ->label('Timeliness')
                            ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'),
                        TextEntry::make('quality_rating')
                            ->label('Quality')
                            ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'),
                    ])
                    ->columns(4)
                    ->columnSpanFull(),

                Section::make('Review')
                    ->schema([
                        TextEntry::make('review')
                            ->label('Customer Review')
                            ->placeholder('No review provided')
                            ->columnSpanFull()
                            ->prose(),
                    ])
                    ->columnSpanFull()
                    ->visible(fn ($record) => !empty($record->review)),
            ]);
    }
}
