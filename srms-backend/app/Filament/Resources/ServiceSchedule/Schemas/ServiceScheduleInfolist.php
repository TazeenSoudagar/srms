<?php

namespace App\Filament\Resources\ServiceSchedule\Schemas;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Filament\Resources\Users\UserResource;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ServiceScheduleInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Schedule Information')
                    ->schema([
                        TextEntry::make('serviceRequest.request_number')
                            ->label('Service Request')
                            ->url(fn ($record) => $record->serviceRequest
                                ? ServiceRequestResource::getUrl('view', ['record' => $record->serviceRequest])
                                : null)
                            ->color('primary')
                            ->weight('bold'),
                        TextEntry::make('customer.name')
                            ->label('Customer')
                            ->url(fn ($record) => $record->customer
                                ? UserResource::getUrl('view', ['record' => $record->customer])
                                : null)
                            ->color('primary'),
                        TextEntry::make('engineer.name')
                            ->label('Engineer')
                            ->url(fn ($record) => $record->engineer
                                ? UserResource::getUrl('view', ['record' => $record->engineer])
                                : null)
                            ->color('primary'),
                        TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'pending' => 'warning',
                                'confirmed' => 'info',
                                'in_progress' => 'primary',
                                'completed' => 'success',
                                'cancelled' => 'danger',
                                default => 'gray',
                            }),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Appointment Details')
                    ->schema([
                        TextEntry::make('scheduled_at')
                            ->label('Scheduled Date & Time')
                            ->dateTime('F j, Y g:i A')
                            ->size('large')
                            ->color('primary'),
                        TextEntry::make('estimated_duration_minutes')
                            ->label('Estimated Duration')
                            ->formatStateUsing(fn ($state) => $state ? "{$state} minutes" : '—'),
                        TextEntry::make('completed_at')
                            ->label('Completed At')
                            ->dateTime('F j, Y g:i A')
                            ->placeholder('Not completed yet'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Pricing & Payment')
                    ->schema([
                        TextEntry::make('actual_price')
                            ->label('Service Charge')
                            ->formatStateUsing(fn ($state) => $state ? '₹'.number_format((float) $state, 2) : 'Not set')
                            ->color(fn ($state) => $state ? 'success' : 'gray'),
                        TextEntry::make('gst_amount')
                            ->label('GST (18%)')
                            ->formatStateUsing(fn ($state) => $state ? '₹'.number_format((float) $state, 2) : '—'),
                        TextEntry::make('total_amount')
                            ->label('Total Amount')
                            ->formatStateUsing(fn ($state) => $state ? '₹'.number_format((float) $state, 2) : '—')
                            ->weight('bold')
                            ->color('primary'),
                        TextEntry::make('payment_status')
                            ->label('Payment Status')
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
                            }),
                        TextEntry::make('payment_due_at')
                            ->label('Payment Due')
                            ->dateTime('F j, Y')
                            ->placeholder('—'),
                        TextEntry::make('payment_uploaded_at')
                            ->label('Proof Uploaded At')
                            ->dateTime('F j, Y g:i A')
                            ->placeholder('—'),
                        TextEntry::make('payment_verified_at')
                            ->label('Verified At')
                            ->dateTime('F j, Y g:i A')
                            ->placeholder('—'),
                    ])
                    ->columns(4)
                    ->columnSpanFull(),

                Section::make('Location')
                    ->schema([
                        TextEntry::make('location')
                            ->columnSpanFull()
                            ->placeholder('No location specified'),
                    ])
                    ->columnSpanFull(),

                Section::make('Notes')
                    ->schema([
                        TextEntry::make('notes')
                            ->html()
                            ->columnSpanFull()
                            ->placeholder('No notes'),
                    ])
                    ->columnSpanFull()
                    ->visible(fn ($record) => !empty($record->notes)),

                Section::make('Timestamps')
                    ->schema([
                        TextEntry::make('reminder_sent_at')
                            ->label('Reminder Sent')
                            ->dateTime()
                            ->placeholder('Not sent'),
                        TextEntry::make('created_at')
                            ->dateTime(),
                        TextEntry::make('updated_at')
                            ->dateTime(),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
