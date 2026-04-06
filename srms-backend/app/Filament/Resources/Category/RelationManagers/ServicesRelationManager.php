<?php

namespace App\Filament\Resources\Category\RelationManagers;

use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ServicesRelationManager extends RelationManager
{
    protected static string $relationship = 'services';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Service Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull(),

                Section::make('Pricing & Duration')
                    ->schema([
                        TextInput::make('base_price')
                            ->label('Base Price')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),
                        TextInput::make('average_duration_minutes')
                            ->label('Average Duration (minutes)')
                            ->numeric()
                            ->minValue(0),
                    ])
                    ->columns(2)
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
                            ->maxSize(5120)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->downloadable()
                            ->openable()
                            ->previewable()
                            ->columnSpanFull()
                            ->helperText('Upload service image (JPG, PNG, WEBP). Maximum size: 5MB.'),
                    ])
                    ->columnSpanFull(),

                Section::make('Settings')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                        Toggle::make('is_popular')
                            ->label('Popular')
                            ->default(false),
                        Toggle::make('is_trending')
                            ->label('Trending')
                            ->default(false),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('base_price')
                    ->label('Price')
                    ->money('USD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('average_duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} min" : '—')
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('is_popular')
                    ->label('Popular')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('view_count')
                    ->label('Views')
                    ->badge()
                    ->color('info')
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->placeholder('All services')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
                Tables\Filters\TernaryFilter::make('is_popular')
                    ->label('Popular')
                    ->placeholder('All services')
                    ->trueLabel('Popular only')
                    ->falseLabel('Not popular'),
            ])
            ->headerActions([
                Actions\CreateAction::make(),
                Actions\AssociateAction::make()
                    ->preloadRecordSelect(),
            ])
            ->actions([
                Actions\ViewAction::make(),
                Actions\EditAction::make(),
                Actions\DissociateAction::make(),
            ])
            ->bulkActions([
                Actions\DissociateBulkAction::make(),
                Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('name', 'asc');
    }
}
