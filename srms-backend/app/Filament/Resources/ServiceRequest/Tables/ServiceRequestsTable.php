<?php
namespace App\Filament\Resources\ServiceRequest\Tables;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ServiceRequestsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('request_number')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('service.name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('title')
                    ->searchable()
                    ->limit(50)
                    ->sortable(),
                TextColumn::make('priority')
                    ->badge()
                // ->color(fn (string $state): string => match ($state) {
                //     'high' => 'danger',
                //     'medium' => 'warning',
                //     'low' => 'info',
                //     default => 'gray',
                // })
                    ->sortable(),
                TextColumn::make('createdBy.first_name')
                    ->label('Created By')
                    ->formatStateUsing(fn($record) => $record->createdBy ? $record->createdBy->first_name . ' ' . $record->createdBy->last_name : '-')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('schedules.engineer.first_name')
                    ->label('Assigned Engineers')
                    ->formatStateUsing(fn($record) => $record->schedules
                            ->pluck('engineer')
                            ->unique('id')
                            ->map(fn($eng) => $eng->first_name . ' ' . $eng->last_name)->join(', ') ?: 'Not scheduled')
                    ->badge()
                    ->color(fn($record) => $record->schedules->count() > 0 ? 'success' : 'warning')
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

                SelectFilter::make('priority')
                    ->options(RequestPriority::options())
                    ->multiple(),
                SelectFilter::make('service_id')
                    ->relationship('service', 'name')
                    ->label('Service')
                    ->multiple(),
                SelectFilter::make('engineer_id')
                    ->label('Assigned Engineer')
                    ->query(fn($query, $data) => $data['value'] ? $query->whereHas('schedules', fn($q) => $q->where('engineer_id', $data['value'])) : $query)
                    ->options(fn() => \App\Models\User::whereHas('role', fn($q) => $q->where('name', 'Support Engineer'))->pluck('first_name', 'id'))
                    ->searchable(),
                Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('created_from')
                            ->label('Created From'),
                        \Filament\Forms\Components\DatePicker::make('created_until')
                            ->label('Created Until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn(Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn(Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    // DeleteBulkAction::make(),
                ]),
            ]);
    }
}
