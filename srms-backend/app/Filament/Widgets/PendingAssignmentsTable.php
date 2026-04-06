<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\ServiceRequest;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class PendingAssignmentsTable extends BaseWidget
{
    protected static ?int $sort = 8;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(ServiceRequest::query()
                ->whereNull('assigned_to')
                ->where('status', 'open')
                ->latest()
                ->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('Request #')
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record]))
                    ->color('warning'),
                Tables\Columns\TextColumn::make('title')
                    ->limit(40),
                Tables\Columns\TextColumn::make('service.name')
                    ->badge(),
                Tables\Columns\TextColumn::make('priority')
                    ->badge(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->since(),
            ]);
    }
}
