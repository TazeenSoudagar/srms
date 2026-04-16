<?php

namespace App\Filament\Resources\Service\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Storage;

class ServiceInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Service Details')
                    ->schema([
                        ImageEntry::make('media.url')
                            ->label('Service Image')
                            ->disk('public')
                            ->size(200)
                            ->defaultImageUrl(
                                'https://ui-avatars.com/api/?name=Service&color=7F9CF5&background=EBF4FF&size=200'
                            )
                            ->getStateUsing(function ($record): ?string {
                                $media = $record->media->first();
                                if (! $media) {
                                    return null;
                                }
                                if ($media->path) {
                                    return $media->path;
                                }
                                $parsed = parse_url($media->url, PHP_URL_PATH);

                                return $parsed
                                    ? ltrim(str_replace('/storage/', '', $parsed), '/')
                                    : null;
                            })
                            ->columnSpanFull(),
                        TextEntry::make('name')
                            ->size('large')
                            ->weight('bold')
                            ->columnSpanFull(),
                        TextEntry::make('category.name')
                            ->label('Category')
                            ->badge()
                            ->color('info'),
                        TextEntry::make('icon')
                            ->label('Icon')
                            ->placeholder('Default icon')
                            ->badge()
                            ->color('gray'),
                        TextEntry::make('description')
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull(),

                Section::make('Pricing & Duration')
                    ->schema([
                        TextEntry::make('base_price')
                            ->label('Base Price')
                            ->money('INR')
                            ->placeholder('Not set'),
                        TextEntry::make('average_duration_minutes')
                            ->label('Average Duration')
                            ->formatStateUsing(fn ($state) => $state ? "{$state} minutes" : 'Not set'),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Discovery & Popularity')
                    ->schema([
                        IconEntry::make('is_popular')
                            ->label('Popular')
                            ->boolean(),
                        IconEntry::make('is_trending')
                            ->label('Trending')
                            ->boolean(),
                        TextEntry::make('popularity_score')
                            ->label('Popularity Score')
                            ->badge()
                            ->color('warning'),
                        TextEntry::make('view_count')
                            ->label('Total Views')
                            ->badge()
                            ->color('success'),
                    ])
                    ->columns(4)
                    ->columnSpanFull(),

                Section::make('Status')
                    ->schema([
                        IconEntry::make('is_active')
                            ->label('Active')
                            ->boolean()
                            ->trueIcon('heroicon-o-check-circle')
                            ->falseIcon('heroicon-o-x-circle')
                            ->trueColor('success')
                            ->falseColor('danger'),
                    ])
                    ->columnSpanFull(),

                Section::make('Statistics')
                    ->schema([
                        TextEntry::make('serviceRequests_count')
                            ->counts('serviceRequests')
                            ->label('Total Service Requests')
                            ->badge()
                            ->color('primary'),
                        TextEntry::make('created_at')
                            ->dateTime('F j, Y'),
                        TextEntry::make('updated_at')
                            ->dateTime('F j, Y g:i A'),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
