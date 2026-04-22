<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class EngineerWorkloadWidget extends BaseWidget
{
    protected static ?int $sort = 9;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(User::query()
                ->whereHas('role', fn ($q) => $q->where('name', 'Support Engineer'))
                ->withCount(['assignedServiceRequests' => fn ($q) => $q->whereNotIn('status', ['completed', 'cancelled'])])
                ->with(['ratingAggregate', 'engineerProfile'])
                ->orderBy('assigned_service_requests_count', 'desc'))
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->formatStateUsing(fn ($record) => $record->first_name . ' ' . $record->last_name)
                    ->url(fn ($record) => UserResource::getUrl('view', ['record' => $record]))
                    ->color('primary'),
                Tables\Columns\TextColumn::make('assigned_service_requests_count')
                    ->label('Active Requests')
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state > 10 => 'danger',
                        $state > 5 => 'warning',
                        default => 'success',
                    }),
                Tables\Columns\TextColumn::make('ratingAggregate.average_rating')
                    ->label('Avg Rating')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 2) . ' ⭐' : '—'),
                Tables\Columns\TextColumn::make('engineerProfile.availability_status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state ? ucfirst($state) : 'Available'),
            ]);
    }
}
