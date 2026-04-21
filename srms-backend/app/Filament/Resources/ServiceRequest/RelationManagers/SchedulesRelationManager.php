<?php

namespace App\Filament\Resources\ServiceRequest\RelationManagers;

use App\Filament\Resources\ServiceSchedule\Concerns\HandlesSchedulePricing;
use App\Models\User;
use App\Notifications\EngineerAssigned;
use App\Notifications\ScheduleCreated;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class SchedulesRelationManager extends RelationManager
{
    use HandlesSchedulePricing;

    protected static string $relationship = 'schedules';

    protected static ?string $title = 'Service Schedules';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Appointment')
                    ->schema([
                        Select::make('engineer_id')
                            ->label('Engineer')
                            ->options(fn () => User::whereHas('role', fn ($q) => $q->where('name', 'Support Engineer'))
                                ->pluck('first_name', 'id'))
                            ->required()
                            ->searchable()
                            ->preload()
                            ->helperText('Select the engineer to assign'),
                        DateTimePicker::make('scheduled_at')
                            ->label('Scheduled Date & Time')
                            ->required()
                            ->native(false)
                            ->minDate(now())
                            ->seconds(false)
                            ->default(fn ($livewire) => $livewire?->ownerRecord?->preferred_time_slot ?? null)
                            ->helperText('Auto-filled from preferred time slot'),
                        Select::make('status')
                            ->required()
                            ->default('pending')
                            ->options([
                                'pending'     => 'Pending',
                                'confirmed'   => 'Confirmed',
                                'in_progress' => 'In Progress',
                                'completed'   => 'Completed',
                                'cancelled'   => 'Cancelled',
                            ])
                            ->native(false),
                        TextInput::make('estimated_duration_minutes')
                            ->label('Estimated Duration (minutes)')
                            ->numeric()
                            ->minValue(0)
                            ->default(fn ($livewire) => $livewire?->ownerRecord?->service?->average_duration_minutes ?? 60)
                            ->suffix('min')
                            ->helperText('Auto-filled from service average duration'),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Pricing')
                    ->schema(static::pricingFields())
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Location & Notes')
                    ->schema([
                        Textarea::make('location')
                            ->rows(2)
                            ->columnSpanFull()
                            ->placeholder('Enter service location address')
                            ->default(fn ($livewire) => $livewire?->ownerRecord?->service_location ?? null)
                            ->helperText('Auto-filled from service request'),
                        RichEditor::make('notes')
                            ->columnSpanFull()
                            ->toolbarButtons(['bold', 'italic', 'bulletList', 'orderedList', 'link']),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('scheduled_at')
            ->columns([
                Tables\Columns\TextColumn::make('engineer.name')
                    ->label('Engineer')
                    ->searchable(['first_name', 'last_name']),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Scheduled For')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->color(fn ($record) => $record->scheduled_at->isPast() && $record->status !== 'completed'
                        ? 'danger'
                        : 'primary'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending'     => 'warning',
                        'confirmed'   => 'info',
                        'in_progress' => 'primary',
                        'completed'   => 'success',
                        'cancelled'   => 'danger',
                        default       => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('actual_price')
                    ->label('Price')
                    ->formatStateUsing(fn ($state) => $state ? '₹' . number_format((float) $state, 2) : '—')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Total (incl. GST)')
                    ->formatStateUsing(fn ($state) => $state ? '₹' . number_format((float) $state, 2) : '—')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('estimated_duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} min" : '—')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('payment_status')
                    ->label('Payment')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'pending'       => 'warning',
                        'paid'          => 'info',
                        'paid_verified' => 'success',
                        default         => 'gray',
                    })
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'pending'       => 'Pending',
                        'paid'          => 'Proof Uploaded',
                        'paid_verified' => 'Verified',
                        default         => '—',
                    })
                    ->toggleable(),
            ])
            ->filters([])
            ->headerActions([
                Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['customer_id'] = $this->ownerRecord->created_by;
                        return static::applyPricingMutation($data, fn () => $this->halt());
                    })
                    ->after(function ($record) {
                        $record->load(['serviceRequest', 'engineer', 'customer']);

                        if ($record->engineer) {
                            $record->engineer->notify(new EngineerAssigned($record));
                        }

                        $customer = $record->customer ?? User::find($record->customer_id);
                        if ($customer) {
                            $customer->notify(new ScheduleCreated($record));
                        }
                    }),
            ])
            ->actions([
                Action::make('confirm')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->form([
                        TextInput::make('actual_price')
                            ->label('Actual Price (₹)')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('₹')
                            ->required()
                            ->default(fn ($record) => $record->actual_price)
                            ->helperText('GST (18%) will be auto-calculated. Customer will be notified with the price.'),
                    ])
                    ->action(function ($record, array $data) {
                        $actualPrice = (float) $data['actual_price'];
                        $gstRate     = 18.00;
                        $gstAmount   = round($actualPrice * ($gstRate / 100), 2);
                        $record->update([
                            'status'       => 'confirmed',
                            'actual_price' => $actualPrice,
                            'gst_rate'     => $gstRate,
                            'gst_amount'   => $gstAmount,
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
                                ->body('Confirm the schedule first (which sets the price) before completing.')
                                ->danger()
                                ->send();

                            return;
                        }
                        $record->update([
                            'status'       => 'completed',
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
                    ->visible(fn ($record) => in_array($record->status, ['pending', 'confirmed']))
                    ->form([
                        DateTimePicker::make('scheduled_at')
                            ->label('New Date & Time')
                            ->required()
                            ->native(false)
                            ->minDate(now()),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update([
                            'scheduled_at' => $data['scheduled_at'],
                            'status'       => 'pending',
                        ]);
                        Notification::make()
                            ->title('Schedule Rescheduled')
                            ->success()
                            ->send();
                    }),

                Action::make('verify_payment')
                    ->label('Verify Payment')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Verify Payment')
                    ->modalDescription(
                        'Confirm that the customer\'s payment proof has been verified. ' .
                        'This will mark the payment as verified.'
                    )
                    ->visible(fn ($record) => $record->status === 'completed' && $record->payment_status === 'paid')
                    ->action(function ($record) {
                        $record->updateQuietly([
                            'payment_status'      => 'paid_verified',
                            'payment_verified_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Payment Verified')
                            ->body('Payment has been marked as verified.')
                            ->success()
                            ->send();
                    }),

                Action::make('view_payment_proof')
                    ->label('Download Proof')
                    ->icon('heroicon-o-document-arrow-down')
                    ->color('gray')
                    ->visible(fn ($record) => $record->status === 'completed' && $record->payment_proof_path !== null)
                    ->action(function ($record) {
                        $path = $record->payment_proof_path;
                        if (! $path || ! Storage::disk('local')->exists($path)) {
                            Notification::make()->title('File not found')->danger()->send();
                            return null;
                        }
                        $ext = pathinfo($path, PATHINFO_EXTENSION);
                        $requestNumber = $record->serviceRequest?->request_number ?? $record->id;
                        $filename = "payment-proof-{$requestNumber}.{$ext}";
                        return Storage::disk('local')->download($path, $filename);
                    }),

                Actions\ViewAction::make(),
                Actions\EditAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        return static::applyPricingMutation($data, fn () => $this->halt());
                    }),
                Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->emptyStateHeading('No Schedules')
            ->emptyStateDescription('No appointments have been scheduled for this request yet.');
    }
}
