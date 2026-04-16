<?php

namespace App\Filament\Resources\Service\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Service Information')
                    ->schema([
                        Select::make('category_id')
                            ->label('Category')
                            ->relationship('category', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255),
                            ]),
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('icon')
                            ->label('Icon')
                            ->maxLength(255)
                            ->placeholder('e.g., wrench-screwdriver, home, cog')
                            ->helperText('Enter a Heroicon name (without prefix)'),
                        Textarea::make('description')
                            ->rows(4)
                            ->maxLength(1000)
                            ->columnSpanFull(),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Service Image')
                    ->schema([
                        FileUpload::make('service_image')
                            ->label('Service Image')
                            ->image()
                            ->disk('public')
                            ->directory('images/services')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->maxSize(5120) // 5MB max
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->downloadable()
                            ->openable()
                            ->previewable()
                            ->columnSpanFull()
                            ->helperText('Upload service image (JPG, PNG, WEBP). Maximum size: 5MB.'),
                    ])
                    ->columnSpanFull(),

                Section::make('Pricing & Duration')
                    ->schema([
                        TextInput::make('base_price')
                            ->label('Base Price')
                            ->numeric()
                            ->prefix('₹')
                            ->minValue(0)
                            ->step(0.01)
                            ->maxValue(99999.99)
                            ->placeholder('0.00'),
                        TextInput::make('average_duration_minutes')
                            ->label('Average Duration (minutes)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(9999)
                            ->suffix('min')
                            ->placeholder('60'),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Discovery & Popularity')
                    ->schema([
                        Toggle::make('is_popular')
                            ->label('Popular')
                            ->default(false)
                            ->helperText('Popular services are featured on homepage'),
                        Toggle::make('is_trending')
                            ->label('Trending')
                            ->default(false)
                            ->helperText('Trending services appear in trending section'),
                        TextInput::make('popularity_score')
                            ->label('Popularity Score')
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->disabled()
                            ->dehydrated(false)
                            ->helperText('Auto-calculated based on views and requests'),
                        TextInput::make('view_count')
                            ->label('View Count')
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->disabled()
                            ->dehydrated(false)
                            ->helperText('Auto-incremented on each view'),
                    ])
                    ->columns(4)
                    ->columnSpanFull(),

                Section::make('Status')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->required()
                            ->helperText('Inactive services are hidden from customers'),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
