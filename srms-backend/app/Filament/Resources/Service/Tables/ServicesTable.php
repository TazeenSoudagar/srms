<?php

namespace App\Filament\Resources\Service\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ServicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('media'))
            ->columns([
                ImageColumn::make('service_image')
                    ->label('Image')
                    ->disk('public')
                    ->size(50)
                    ->circular()
                    ->getStateUsing(function ($record): ?string {
                        $media = $record->media->first();
                        if (! $media) {
                            return null;
                        }
                        if ($media->path) {
                            return $media->path;
                        }
                        // Fallback: extract relative path from stored URL for legacy records
                        $parsed = parse_url($media->url, PHP_URL_PATH);

                        return $parsed
                            ? ltrim(str_replace('/storage/', '', $parsed), '/')
                            : null;
                    })
                    ->defaultImageUrl(
                        'https://ui-avatars.com/api/?name=Service&color=7F9CF5&background=EBF4FF&size=50'
                    ),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->color('info')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('base_price')
                    ->label('Price')
                    ->money('INR')
                    ->sortable(),
                TextColumn::make('average_duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} min" : '—')
                    ->alignCenter()
                    ->toggleable(),
                IconColumn::make('is_popular')
                    ->label('Popular')
                    ->boolean()
                    ->alignCenter()
                    ->toggleable(),
                IconColumn::make('is_trending')
                    ->label('Trending')
                    ->boolean()
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('view_count')
                    ->label('Views')
                    ->badge()
                    ->color('success')
                    ->alignCenter()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('popularity_score')
                    ->label('Score')
                    ->badge()
                    ->color('warning')
                    ->alignCenter()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable()
                    ->alignCenter(),
                TextColumn::make('serviceRequests_count')
                    ->counts('serviceRequests')
                    ->label('Requests')
                    ->badge()
                    ->color('primary')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
                TernaryFilter::make('is_active')
                    ->label('Status')
                    ->placeholder('All services')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
                TernaryFilter::make('is_popular')
                    ->label('Popular')
                    ->placeholder('All services')
                    ->trueLabel('Popular only')
                    ->falseLabel('Not popular'),
                TernaryFilter::make('is_trending')
                    ->label('Trending')
                    ->placeholder('All services')
                    ->trueLabel('Trending only')
                    ->falseLabel('Not trending'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('name', 'asc');
    }
}
