<?php

namespace App\Filament\Resources\Rating\Tables;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class RatingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('serviceRequest.request_number')
                    ->label('Request #')
                    ->searchable()
                    ->sortable()
                    ->url(fn ($record) => $record->serviceRequest
                        ? ServiceRequestResource::getUrl('view', ['record' => $record->serviceRequest])
                        : null)
                    ->color('primary')
                    ->weight('bold'),
                TextColumn::make('user.name')
                    ->label('Customer')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('engineer.name')
                    ->label('Engineer')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable(),
                TextColumn::make('rating')
                    ->label('Overall')
                    ->formatStateUsing(fn ($state) => str_repeat('⭐', (int) $state))
                    ->sortable()
                    ->alignCenter(),
                TextColumn::make('professionalism_rating')
                    ->label('Professionalism')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('timeliness_rating')
                    ->label('Timeliness')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('quality_rating')
                    ->label('Quality')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('⭐', (int) $state) : '—')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('review')
                    ->label('Review')
                    ->limit(50)
                    ->searchable()
                    ->wrap()
                    ->toggleable(isToggledHiddenByDefault: false),
                IconColumn::make('is_anonymous')
                    ->label('Anonymous')
                    ->boolean()
                    ->trueIcon('heroicon-o-eye-slash')
                    ->falseIcon('heroicon-o-eye')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('rating')
                    ->label('Overall Rating')
                    ->options([
                        '5' => '⭐⭐⭐⭐⭐ (5 stars)',
                        '4' => '⭐⭐⭐⭐ (4 stars)',
                        '3' => '⭐⭐⭐ (3 stars)',
                        '2' => '⭐⭐ (2 stars)',
                        '1' => '⭐ (1 star)',
                    ]),
                SelectFilter::make('engineer_id')
                    ->label('Engineer')
                    ->relationship('engineer', 'first_name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('service_id')
                    ->label('Service')
                    ->relationship('service', 'name')
                    ->searchable()
                    ->preload(),
                TernaryFilter::make('is_anonymous')
                    ->label('Anonymous')
                    ->placeholder('All ratings')
                    ->trueLabel('Anonymous only')
                    ->falseLabel('Public only'),
                Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('created_from')
                            ->label('From'),
                        \Filament\Forms\Components\DatePicker::make('created_until')
                            ->label('Until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
