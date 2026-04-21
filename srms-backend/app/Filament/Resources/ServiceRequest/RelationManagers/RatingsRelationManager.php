<?php

namespace App\Filament\Resources\ServiceRequest\RelationManagers;

use Filament\Actions;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class RatingsRelationManager extends RelationManager
{
    protected static string $relationship = 'ratings';

    protected static ?string $title = 'Customer Ratings';

    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Rating Details')
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Customer'),
                        TextEntry::make('engineer.name')
                            ->label('Engineer Rated'),
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
                            ->color('warning')
                            ->weight('bold'),
                        TextEntry::make('professionalism_rating')
                            ->label('Professionalism')
                            ->formatStateUsing(
                                fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'
                            ),
                        TextEntry::make('timeliness_rating')
                            ->label('Timeliness')
                            ->formatStateUsing(
                                fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'
                            ),
                        TextEntry::make('quality_rating')
                            ->label('Quality')
                            ->formatStateUsing(
                                fn ($state) => $state ? str_repeat('⭐', (int) $state) . " ({$state}/5)" : '—'
                            ),
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
                    ->visible(fn ($record) => ! empty($record->review)),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('rating')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Customer'),
                Tables\Columns\TextColumn::make('engineer.name')
                    ->label('Engineer Rated'),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Overall Rating')
                    ->formatStateUsing(fn ($state) => str_repeat('⭐', (int) $state) . " ({$state}/5)"),
                Tables\Columns\TextColumn::make('professionalism_rating')
                    ->label('Professionalism')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('timeliness_rating')
                    ->label('Timeliness')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('quality_rating')
                    ->label('Quality')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                // No create - ratings are customer-submitted only
            ])
            ->actions([
                Actions\ViewAction::make(),
            ])
            ->bulkActions([
                // No bulk actions
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No Ratings')
            ->emptyStateDescription('No ratings have been submitted for this request yet.');
    }
}
