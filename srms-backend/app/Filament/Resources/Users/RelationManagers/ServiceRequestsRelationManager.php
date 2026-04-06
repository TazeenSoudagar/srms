<?php

namespace App\Filament\Resources\Users\RelationManagers;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use Filament\Actions;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ServiceRequestsRelationManager extends RelationManager
{
    protected static string $relationship = 'serviceRequests';

    protected static ?string $title = 'Service Requests';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('request_number')
            ->modifyQueryUsing(fn ($query) => $query->whereHas('createdBy', fn ($q) => $q->where('id', $this->ownerRecord->id))
                ->orWhereHas('assignedTo', fn ($q) => $q->where('id', $this->ownerRecord->id)))
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('Request #')
                    ->searchable()
                    ->sortable()
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record]))
                    ->color('primary')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('title')
                    ->limit(50)
                    ->searchable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('service.name')
                    ->label('Service')
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state): string => match ($state) {
                        RequestStatus::Open, 'open' => 'info',
                        RequestStatus::InProgress, 'in_progress' => 'warning',
                        RequestStatus::Closed, 'closed' => 'success',
                        RequestStatus::Cancelled, 'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('priority')
                    ->badge()
                    ->color(fn ($state): string => match ($state) {
                        RequestPriority::Low, 'low' => 'success',
                        RequestPriority::Medium, 'medium' => 'warning',
                        RequestPriority::High, 'high' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('createdBy.name')
                    ->label('Created By')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('assignedTo.name')
                    ->label('Assigned To')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'open' => 'Open',
                        'in_progress' => 'In Progress',
                        'pending' => 'Pending',
                        'resolved' => 'Resolved',
                        'closed' => 'Closed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->multiple(),
            ])
            ->headerActions([
                // No create - service requests are created separately
            ])
            ->actions([
                Actions\ViewAction::make()
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record])),
            ])
            ->bulkActions([
                // No bulk actions
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No Service Requests')
            ->emptyStateDescription('This user has no service requests created or assigned.');
    }
}
