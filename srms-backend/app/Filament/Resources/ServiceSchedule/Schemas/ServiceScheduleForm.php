<?php

namespace App\Filament\Resources\ServiceSchedule\Schemas;

use App\Models\ServiceRequest;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ServiceScheduleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Schedule Details')
                    ->schema([
                        Select::make('service_request_id')
                            ->label('Service Request')
                            ->relationship('serviceRequest', 'request_number')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->reactive()
                            ->afterStateUpdated(function ($state, callable $set) {
                                if ($state) {
                                    $serviceRequest = ServiceRequest::with('service')->find($state);
                                    if ($serviceRequest) {
                                        // Auto-fill customer from request
                                        $set('customer_id', $serviceRequest->created_by);

                                        // Auto-fill scheduled_at from preferred_time_slot
                                        if ($serviceRequest->preferred_time_slot) {
                                            $set('scheduled_at', $serviceRequest->preferred_time_slot);
                                        }

                                        // Auto-fill estimated duration from service
                                        if ($serviceRequest->service?->average_duration_minutes) {
                                            $set('estimated_duration_minutes', $serviceRequest->service->average_duration_minutes);
                                        }

                                        // Auto-fill location from service request
                                        if ($serviceRequest->service_location) {
                                            $set('location', $serviceRequest->service_location);
                                        }
                                    }
                                } else {
                                    // Clear fields when service request is cleared
                                    $set('customer_id', null);
                                    $set('scheduled_at', null);
                                    $set('estimated_duration_minutes', null);
                                    $set('location', null);
                                }
                            }),
                        Select::make('customer_id')
                            ->label('Customer')
                            ->relationship('customer', 'first_name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->disabled(fn ($get) => $get('service_request_id') !== null)
                            ->helperText('Auto-filled from service request'),
                        Select::make('engineer_id')
                            ->label('Engineer')
                            ->options(function () {
                                return User::whereHas('role', function ($query) {
                                    $query->where('name', 'Support Engineer');
                                })->pluck('first_name', 'id');
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->helperText('Select the engineer to assign this schedule'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Appointment Details')
                    ->schema([
                        DateTimePicker::make('scheduled_at')
                            ->label('Scheduled Date & Time')
                            ->required()
                            ->native(false)
                            ->minDate(now())
                            ->seconds(false),
                        Select::make('status')
                            ->required()
                            ->default('pending')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'in_progress' => 'In Progress',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])
                            ->native(false),
                        TextInput::make('estimated_duration_minutes')
                            ->label('Estimated Duration (minutes)')
                            ->numeric()
                            ->minValue(0)
                            ->default(60)
                            ->suffix('min'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Pricing')
                    ->schema([
                        TextInput::make('actual_price')
                            ->label('Actual Price (₹)')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Required when confirming or completing. GST (18%) is auto-calculated.')
                            ->placeholder('0.00'),
                        TextInput::make('gst_rate')
                            ->label('GST Rate (%)')
                            ->numeric()
                            ->default(18)
                            ->suffix('%')
                            ->disabled()
                            ->dehydrated(false)
                            ->helperText('Current GST rate (auto-applied)'),
                        TextInput::make('total_amount')
                            ->label('Total Amount (₹)')
                            ->prefix('₹')
                            ->disabled()
                            ->dehydrated(false)
                            ->helperText('Auto-calculated: Price + GST'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Location & Notes')
                    ->schema([
                        Textarea::make('location')
                            ->rows(2)
                            ->columnSpanFull()
                            ->placeholder('Enter service location address'),
                        RichEditor::make('notes')
                            ->columnSpanFull()
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'bulletList',
                                'orderedList',
                                'link',
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
