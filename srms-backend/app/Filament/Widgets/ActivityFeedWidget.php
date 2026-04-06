<?php

namespace App\Filament\Widgets;

use App\Models\ActivityLog;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class ActivityFeedWidget extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?int $sort = 11;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(ActivityLog::query()->latest()->limit(20))
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User'),
                Tables\Columns\TextColumn::make('action')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'created' => 'success',
                        'updated' => 'info',
                        'deleted' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('loggable_type')
                    ->label('Model')
                    ->formatStateUsing(fn ($state) => class_basename($state)),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Time')
                    ->since(),
            ]);
    }
}
