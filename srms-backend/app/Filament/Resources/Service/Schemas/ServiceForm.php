<?php

namespace App\Filament\Resources\Service\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->columnSpan(1),
                Textarea::make('description')
                    ->rows(4)
                    ->columnSpanFull(),
                FileUpload::make('service_image')
                    ->label('Service Image')
                    ->required()
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
                    ->helperText('Upload service image (JPG, PNG, WEBP). Maximum size: 5MB. Required field.'),
                Toggle::make('is_active')
                    ->default(true)
                    ->required()
                    ->columnSpan(1),
                Toggle::make('is_popular')
                    ->label('Mark as Popular')
                    ->default(false)
                    ->helperText('Popular services will be featured on the homepage')
                    ->columnSpan(1),
            ]);
    }
}
