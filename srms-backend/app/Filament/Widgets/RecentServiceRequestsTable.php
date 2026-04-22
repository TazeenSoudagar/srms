<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\ServiceRequest;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentServiceRequestsTable extends BaseWidget
{
    protected static ?int $sort = 6;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(ServiceRequest::query()->with('schedules.engineer')->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('Request #')
                    ->url(fn ($record) => ServiceRequestResource::getUrl('view', ['record' => $record]))
                    ->color('primary'),
                Tables\Columns\TextColumn::make('title')
                    ->limit(40),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
                Tables\Columns\TextColumn::make('priority')
                    ->badge(),
                Tables\Columns\TextColumn::make('engineer')
                    ->label('Engineer')
                    ->getStateUsing(function ($record) {
                        $engineer = $record->schedules->first()?->engineer;
                        return $engineer
                            ? trim($engineer->first_name . ' ' . $engineer->last_name)
                            : null;
                    })
                    ->placeholder('Unassigned'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->since(),
            ]);
    }
}
