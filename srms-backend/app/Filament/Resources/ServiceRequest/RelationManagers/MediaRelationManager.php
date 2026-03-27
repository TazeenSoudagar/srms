<?php

namespace App\Filament\Resources\ServiceRequest\RelationManagers;

use Filament\Actions;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class MediaRelationManager extends RelationManager
{
    protected static string $relationship = 'media';

    protected static ?string $title = 'Attachments';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                // Read-only, customers upload from frontend
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('File Name')
                    ->searchable()
                    ->sortable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('url')
                    ->label('File')
                    ->formatStateUsing(fn () => 'Download')
                    ->url(fn ($record) => url(ltrim($record->url, '/')))
                    ->openUrlInNewTab()
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('primary'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Uploaded At')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                // No create action - customers upload from frontend
            ])
            ->actions([
                Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No attachments')
            ->emptyStateDescription('Customer has not uploaded any files yet.');
    }
}
