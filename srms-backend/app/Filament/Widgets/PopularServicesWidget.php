<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Service\ServiceResource;
use App\Models\Service;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class PopularServicesWidget extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?int $sort = 10;

    public function table(Table $table): Table
    {
        return $table
            ->query(Service::query()
                ->withCount('serviceRequests')
                ->orderBy('service_requests_count', 'desc')
                ->limit(5))
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->url(fn ($record) => ServiceResource::getUrl('view', ['record' => $record]))
                    ->color('primary'),
                Tables\Columns\TextColumn::make('category.name')
                    ->badge(),
                Tables\Columns\TextColumn::make('service_requests_count')
                    ->label('Requests')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('view_count')
                    ->label('Views')
                    ->badge()
                    ->color('info'),
            ]);
    }
}
