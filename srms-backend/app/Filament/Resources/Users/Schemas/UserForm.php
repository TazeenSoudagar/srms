<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\Service;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('first_name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('last_name')
                            ->maxLength(255),
                        TextInput::make('phone')
                            ->tel()
                            ->maxLength(20),
                        TextInput::make('email')
                            ->label('Email address')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Select::make('role_id')
                            ->label('Role')
                            ->relationship('role', 'name')
                            ->required()
                            ->reactive()
                            ->preload(),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->required(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Profile Picture')
                    ->schema([
                        FileUpload::make('avatar')
                            ->label('Avatar')
                            ->image()
                            ->disk('public')
                            ->directory('avatars')
                            ->imageEditor()
                            ->circleCropper()
                            ->maxSize(2048)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->downloadable()
                            ->openable()
                            ->previewable()
                            ->columnSpanFull()
                            ->helperText('Upload profile picture (JPG, PNG, WEBP). Maximum size: 2MB.'),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),

                Section::make('Engineer Profile')
                    ->schema([
                        RichEditor::make('bio')
                            ->label('Biography')
                            ->columnSpanFull()
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'bulletList',
                                'orderedList',
                                'link',
                            ])
                            ->placeholder('Enter engineer bio...'),
                        TextInput::make('hourly_rate')
                            ->label('Hourly Rate')
                            ->numeric()
                            ->prefix('₹')
                            ->minValue(0)
                            ->step(0.01)
                            ->maxValue(9999.99),
                        TextInput::make('years_of_experience')
                            ->label('Years of Experience')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(50)
                            ->suffix('years'),
                        Select::make('specializations')
                            ->label('Specializations')
                            ->multiple()
                            ->options(fn () => Service::active()->pluck('name', 'name')->toArray())
                            ->searchable()
                            ->columnSpanFull()
                            ->helperText('Select the services this engineer specialises in'),
                        Select::make('availability_status')
                            ->label('Availability Status')
                            ->options([
                                'available' => 'Available',
                                'busy' => 'Busy',
                                'offline' => 'Offline',
                            ])
                            ->default('available')
                            ->native(false),
                    ])
                    ->columns(2)
                    ->columnSpanFull()
                    ->visible(fn (Get $get) => self::isSupportEngineer($get('role_id')))
                    ->collapsible(),

                Section::make('Engineer Documents')
                    ->description('Upload verification documents for the engineer (ID proof, certifications, etc.). Engineers cannot log in without at least one document.')
                    ->schema([
                        FileUpload::make('engineer_documents')
                            ->label('Documents')
                            ->multiple()
                            ->disk('public')
                            ->directory('engineer-documents')
                            ->maxSize(5120)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
                            ->downloadable()
                            ->openable()
                            ->previewable()
                            ->reorderable()
                            ->columnSpanFull()
                            ->helperText('Accepted: JPG, PNG, WEBP, PDF. Max 5MB per file. Engineers must have at least one document to log in.'),
                    ])
                    ->columnSpanFull()
                    ->visible(fn (Get $get) => self::isSupportEngineer($get('role_id')))
                    ->collapsible(),

                Section::make('Location Information')
                    ->schema([
                        Textarea::make('address')
                            ->rows(2)
                            ->maxLength(500)
                            ->columnSpanFull(),
                        TextInput::make('city')
                            ->maxLength(255),
                        TextInput::make('state')
                            ->maxLength(255),
                        TextInput::make('country')
                            ->maxLength(255),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->visible(fn (Get $get) => self::isSupportEngineer($get('role_id')))
                    ->collapsible(),
            ]);
    }

    private static function isSupportEngineer(mixed $roleId): bool
    {
        if (! $roleId) {
            return false;
        }

        return \App\Models\Role::find($roleId)?->name === 'Support Engineer';
    }
}
