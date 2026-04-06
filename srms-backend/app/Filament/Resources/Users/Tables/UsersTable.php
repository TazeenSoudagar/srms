<?php
namespace App\Filament\Resources\Users\Tables;

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

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn($query) => $query->with('role'))
            ->columns([
                ImageColumn::make('avatar.url')
                    ->label('Avatar')
                    ->circular()
                    ->defaultImageUrl(fn($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->first_name . ' ' . $record->last_name) . '&color=7F9CF5&background=EBF4FF')
                    ->size(40)
                    ->toggleable(),
                TextColumn::make('name')
                    ->label('Name')
                    ->formatStateUsing(fn($record) => $record->first_name . ' ' . $record->last_name)
                    ->searchable(['first_name', 'last_name'])
                    ->sortable(['first_name'])
                    ->weight('bold'),
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable()
                    ->icon('heroicon-o-envelope'),
                TextColumn::make('phone')
                    ->searchable()
                    ->copyable()
                    ->icon('heroicon-o-phone')
                    ->toggleable(),
                TextColumn::make('role.name')
                    ->label('Role')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Admin'            => 'danger',
                        'Support Engineer' => 'warning',
                        'Client'           => 'success',
                        default            => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('availability_status')
                    ->label('Availability')
                    ->badge()
                    ->color(fn(?string $state): string => match ($state) {
                        'available' => 'success',
                        'busy'      => 'warning',
                        'offline'   => 'danger',
                        default     => 'gray',
                    })
                    ->formatStateUsing(fn(?string $state) => $state ? ucfirst($state) : '—')
                    ->visible(fn($record) => $record?->role?->name === 'Support Engineer')
                    ->toggleable(),
                TextColumn::make('hourly_rate')
                    ->label('Rate')
                    ->money('USD')
                    ->visible(fn($record) => $record?->role?->name === 'Support Engineer')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('years_of_experience')
                    ->label('Experience')
                    ->formatStateUsing(fn($state) => $state ? "{$state} yrs" : '—')
                    ->visible(fn($record) => $record?->role?->name === 'Support Engineer')
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable()
                    ->alignCenter(),
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
                SelectFilter::make('role_id')
                    ->label('Role')
                    ->relationship('role', 'name')
                    ->preload(),
                TernaryFilter::make('is_active')
                    ->label('Status')
                    ->placeholder('All users')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
                SelectFilter::make('availability_status')
                    ->label('Availability')
                    ->options([
                        'available' => 'Available',
                        'busy'      => 'Busy',
                        'offline'   => 'Offline',
                    ])
                    ->multiple(),
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
            ->defaultSort('created_at', 'desc');
    }
}
