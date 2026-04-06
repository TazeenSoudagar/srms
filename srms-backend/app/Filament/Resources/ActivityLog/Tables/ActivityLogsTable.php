<?php

namespace App\Filament\Resources\ActivityLog\Tables;

use App\Filament\Resources\Users\UserResource;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use pxlrbt\FilamentExcel\Actions\Tables\ExportAction;
use pxlrbt\FilamentExcel\Exports\ExcelExport;

class ActivityLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->url(fn ($record) => $record->user
                        ? UserResource::getUrl('view', ['record' => $record->user])
                        : null)
                    ->color('primary'),
                TextColumn::make('user.role.name')
                    ->label('Role')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Admin' => 'danger',
                        'Support Engineer' => 'warning',
                        'Client' => 'success',
                        default => 'gray',
                    })
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('action')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'created' => 'success',
                        'updated' => 'info',
                        'deleted' => 'danger',
                        'restored' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('loggable_type')
                    ->label('Model')
                    ->formatStateUsing(fn ($state) => class_basename($state))
                    ->badge()
                    ->color('primary')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('loggable_id')
                    ->label('ID')
                    ->sortable()
                    ->alignCenter(),
                TextColumn::make('details')
                    ->label('Details Preview')
                    ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state) : '—')
                    ->limit(50)
                    ->toggleable()
                    ->wrap(),
                TextColumn::make('created_at')
                    ->label('Timestamp')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('user_id')
                    ->label('User')
                    ->relationship('user', 'first_name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('action')
                    ->options([
                        'created' => 'Created',
                        'updated' => 'Updated',
                        'deleted' => 'Deleted',
                        'restored' => 'Restored',
                        'viewed' => 'Viewed',
                        'assigned' => 'Assigned',
                        'commented' => 'Commented',
                    ])
                    ->multiple(),
                SelectFilter::make('loggable_type')
                    ->label('Model Type')
                    ->options([
                        'App\\Models\\ServiceRequest' => 'Service Request',
                        'App\\Models\\User' => 'User',
                        'App\\Models\\Service' => 'Service',
                        'App\\Models\\Category' => 'Category',
                        'App\\Models\\ServiceSchedule' => 'Service Schedule',
                        'App\\Models\\Rating' => 'Rating',
                        'App\\Models\\Comment' => 'Comment',
                    ]),
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
                ExportAction::make()
                    ->exports([
                        ExcelExport::make()
                            ->fromTable()
                            ->withFilename(fn () => 'activity-logs-' . date('Y-m-d-His'))
                            ->withWriterType(\Maatwebsite\Excel\Excel::XLSX),
                    ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
