<?php

namespace App\Filament\Resources\Users\RelationManagers;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use Filament\Actions;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class RatingsReceivedRelationManager extends RelationManager
{
    protected static string $relationship = 'ratingsReceived';

    protected static ?string $title = 'Ratings Received (As Engineer)';

    public static function canViewForRecord(\Illuminate\Database\Eloquent\Model $ownerRecord, string $pageClass): bool
    {
        return $ownerRecord->role?->name === 'Support Engineer';
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('rating')
            ->columns([
                Tables\Columns\TextColumn::make('serviceRequest.request_number')
                    ->label('Request #')
                    ->url(fn ($record) => $record->serviceRequest
                        ? ServiceRequestResource::getUrl('view', ['record' => $record->serviceRequest])
                        : null)
                    ->color('primary'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Customer'),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Overall')
                    ->formatStateUsing(fn ($state) => str_repeat('⭐', (int) $state)),
                Tables\Columns\TextColumn::make('professionalism_rating')
                    ->label('Professionalism')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('timeliness_rating')
                    ->label('Timeliness')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('quality_rating')
                    ->label('Quality')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—'),
                Tables\Columns\TextColumn::make('review')
                    ->limit(50)
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
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
                // No bulk actions for ratings
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No Ratings Received')
            ->emptyStateDescription('This engineer has not received any ratings yet.');
    }
}
