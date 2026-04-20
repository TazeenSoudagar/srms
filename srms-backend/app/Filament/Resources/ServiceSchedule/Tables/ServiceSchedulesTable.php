<?php

namespace App\Filament\Resources\ServiceSchedule\Tables;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ServiceSchedulesTable
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
                TextColumn::make('customer.name')
                    ->label('Customer')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('engineer.name')
                    ->label('Engineer')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable(),
                TextColumn::make('scheduled_at')
                    ->label('Scheduled For')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->color(fn ($record) => $record->scheduled_at->isPast() && $record->status !== 'completed' ? 'danger' : 'primary'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'in_progress' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('location')
                    ->limit(30)
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('estimated_duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} min" : '—')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'in_progress' => 'In Progress',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->multiple(),
                SelectFilter::make('engineer_id')
                    ->label('Engineer')
                    ->relationship('engineer', 'first_name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('customer_id')
                    ->label('Customer')
                    ->relationship('customer', 'first_name')
                    ->searchable()
                    ->preload(),
                Filter::make('scheduled_at')
                    ->form([
                        DateTimePicker::make('scheduled_from')
                            ->label('From'),
                        DateTimePicker::make('scheduled_until')
                            ->label('Until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['scheduled_from'],
                                fn (Builder $query, $date): Builder => $query->where('scheduled_at', '>=', $date),
                            )
                            ->when(
                                $data['scheduled_until'],
                                fn (Builder $query, $date): Builder => $query->where('scheduled_at', '<=', $date),
                            );
                    }),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                Action::make('confirm')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => in_array($record->status, ['pending']))
                    ->form([
                        \Filament\Forms\Components\TextInput::make('actual_price')
                            ->label('Actual Price (₹)')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('₹')
                            ->required()
                            ->default(fn ($record) => $record->actual_price)
                            ->helperText('Enter the assessed price for this service. GST (18%) will be applied. The customer will be notified with the price breakdown.'),
                    ])
                    ->action(function ($record, array $data) {
                        $actualPrice = (float) $data['actual_price'];
                        $gstRate = 18.00;
                        $gstAmount = round($actualPrice * ($gstRate / 100), 2);
                        $record->update([
                            'status' => 'confirmed',
                            'actual_price' => $actualPrice,
                            'gst_rate' => $gstRate,
                            'gst_amount' => $gstAmount,
                            'total_amount' => round($actualPrice + $gstAmount, 2),
                        ]);
                        Notification::make()
                            ->title('Schedule Confirmed')
                            ->body('Customer has been notified with the price breakdown.')
                            ->success()
                            ->send();
                    }),
                Action::make('complete')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalDescription('Mark this schedule as completed? An invoice will be generated and emailed to the customer.')
                    ->visible(fn ($record) => in_array($record->status, ['confirmed', 'in_progress']))
                    ->action(function ($record) {
                        if (! $record->actual_price) {
                            Notification::make()
                                ->title('Price required')
                                ->body('Set the actual price (via Confirm action) before completing.')
                                ->danger()
                                ->send();
                            return;
                        }
                        $record->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Schedule Completed')
                            ->body('Invoice will be generated and emailed to the customer.')
                            ->success()
                            ->send();
                    }),
                Action::make('cancel')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => in_array($record->status, ['pending', 'confirmed']))
                    ->action(function ($record) {
                        $record->update(['status' => 'cancelled']);
                        Notification::make()
                            ->title('Schedule Cancelled')
                            ->warning()
                            ->send();
                    }),
                Action::make('reschedule')
                    ->icon('heroicon-o-calendar')
                    ->color('warning')
                    ->form([
                        DateTimePicker::make('scheduled_at')
                            ->label('New Date & Time')
                            ->required()
                            ->native(false)
                            ->minDate(now()),
                    ])
                    ->visible(fn ($record) => in_array($record->status, ['pending', 'confirmed']))
                    ->action(function ($record, array $data) {
                        $record->update([
                            'scheduled_at' => $data['scheduled_at'],
                            'status' => 'pending',
                        ]);
                        Notification::make()
                            ->title('Schedule Rescheduled')
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('scheduled_at', 'desc');
    }
}
