<?php

namespace App\Filament\Resources\ServiceRequest\RelationManagers;

use Filament\Actions;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class RatingsRelationManager extends RelationManager
{
    protected static string $relationship = 'ratings';

    protected static ?string $title = 'Customer Ratings';

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
                Tables\Columns\IconColumn::make('is_anonymous')
                    ->label('Anonymous')
                    ->boolean(),
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
