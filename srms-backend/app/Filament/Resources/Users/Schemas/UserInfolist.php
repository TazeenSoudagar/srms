<?php
namespace App\Filament\Resources\Users\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Profile')
                    ->schema([
                        ImageEntry::make('avatar.url')
                            ->label('Avatar')
                            ->circular()
                            ->defaultImageUrl(fn($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->first_name . ' ' . $record->last_name) . '&color=7F9CF5&background=EBF4FF')
                            ->size(100)
                            ->columnSpan(1),
                        TextEntry::make('name')
                            ->label('Full Name')
                            ->formatStateUsing(fn($record) => $record->first_name . ' ' . $record->last_name)
                            ->size('large')
                            ->weight('bold')
                            ->columnSpan(1),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Basic Information')
                    ->schema([
                        TextEntry::make('email')
                            ->label('Email')
                            ->copyable()
                            ->icon('heroicon-o-envelope'),
                        TextEntry::make('phone')
                            ->copyable()
                            ->icon('heroicon-o-phone')
                            ->placeholder('—'),
                        TextEntry::make('role.name')
                            ->label('Role')
                            ->badge()
                            ->color(fn(string $state): string => match ($state) {
                                'Admin'            => 'danger',
                                'Support Engineer' => 'warning',
                                'Client'           => 'success',
                                default            => 'gray',
                            }),
                        IconEntry::make('is_active')
                            ->label('Status')
                            ->boolean()
                            ->trueIcon('heroicon-o-check-circle')
                            ->falseIcon('heroicon-o-x-circle')
                            ->trueColor('success')
                            ->falseColor('danger'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Engineer Profile')
                    ->schema([
                        TextEntry::make('engineerProfile.bio')
                            ->label('Biography')
                            ->html()
                            ->columnSpanFull()
                            ->placeholder('No bio provided'),
                        TextEntry::make('engineerProfile.hourly_rate')
                            ->label('Hourly Rate')
                            ->money('INR')
                            ->placeholder('—'),
                        TextEntry::make('engineerProfile.years_of_experience')
                            ->label('Experience')
                            ->formatStateUsing(fn($state) => $state ? "{$state} years" : '—')
                            ->placeholder('—'),
                        TextEntry::make('engineerProfile.availability_status')
                            ->label('Availability')
                            ->badge()
                            ->color(fn(?string $state): string => match ($state) {
                                'available' => 'success',
                                'busy'      => 'warning',
                                'offline'   => 'danger',
                                default     => 'gray',
                            })
                            ->formatStateUsing(fn(?string $state) => $state ? ucfirst($state) : 'Not set'),
                        TextEntry::make('engineerProfile.specializations')
                            ->label('Specializations')
                            ->badge()
                            ->columnSpanFull()
                            ->placeholder('No specializations listed'),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->visible(fn($record) => $record->role?->name === 'Support Engineer')
                    ->collapsible(),

                Section::make('Location')
                    ->schema([
                        TextEntry::make('address')
                            ->columnSpanFull()
                            ->placeholder('—'),
                        TextEntry::make('city')
                            ->placeholder('—'),
                        TextEntry::make('state')
                            ->placeholder('—'),
                        TextEntry::make('country')
                            ->placeholder('—'),
                        TextEntry::make('latitude')
                            ->placeholder('—'),
                        TextEntry::make('longitude')
                            ->placeholder('—'),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->visible(fn($record) => $record->role?->name === 'Support Engineer')
                    ->collapsible(),

                Section::make('Statistics')
                    ->schema([
                        TextEntry::make('ratingsReceived_count')
                            ->counts('ratingsReceived')
                            ->label('Total Ratings Received')
                            ->badge()
                            ->color('success')
                            ->visible(fn($record) => $record->role?->name === 'Support Engineer'),
                        TextEntry::make('ratingAggregate.average_rating')
                            ->label('Average Rating')
                            ->formatStateUsing(fn($state) => $state ? number_format($state, 2) . ' ⭐' : '—')
                            ->color('warning')
                            ->visible(fn($record) => $record->role?->name === 'Support Engineer'),
                        TextEntry::make('created_at')
                            ->label('Joined')
                            ->dateTime('F j, Y'),
                        TextEntry::make('updated_at')
                            ->label('Last Updated')
                            ->dateTime('F j, Y g:i A'),
                    ])
                    ->columns(4)
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
