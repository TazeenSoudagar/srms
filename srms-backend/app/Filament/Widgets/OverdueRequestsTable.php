<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\ServiceRequest;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class OverdueRequestsTable extends BaseWidget
{
    protected static ?int $sort = 7;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(ServiceRequest::query()
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->whereNotIn('status', ['resolved', 'closed', 'cancelled'])
                ->latest('due_date')
                ->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('Request #')
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record]))
                    ->color('danger'),
                Tables\Columns\TextColumn::make('title')
                    ->limit(40),
                Tables\Columns\TextColumn::make('due_date')
                    ->dateTime()
                    ->color('danger')
                    ->icon('heroicon-o-exclamation-triangle'),
                Tables\Columns\TextColumn::make('schedules.0.engineer.name')
                    ->label('Engineer')
                    ->placeholder('Unassigned'),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
            ]);
    }
}
