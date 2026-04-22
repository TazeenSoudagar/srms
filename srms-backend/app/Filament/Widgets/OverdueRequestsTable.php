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

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = ServiceRequest::query()
            ->with('schedules.engineer')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->whereNotIn('status', ['closed', 'cancelled'])
            ->latest('due_date');

        return $table
            ->query($query)
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('Request #')
                    ->url(fn($record) => ServiceRequestResource::getUrl('view', ['record' => $record]))
                    ->color('danger'),
                Tables\Columns\TextColumn::make('title')
                    ->limit(40),
                Tables\Columns\TextColumn::make('due_date')
                    ->date()
                    ->color('danger')
                    ->icon('heroicon-o-exclamation-triangle'),
                Tables\Columns\TextColumn::make('engineer')
                    ->label('Engineer')
                    ->getStateUsing(function ($record) {
                        $engineer = $record->schedules->first()?->engineer;
                        return $engineer
                            ? trim($engineer->first_name . ' ' . $engineer->last_name)
                            : null;
                    })
                    ->placeholder('Unassigned'),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
            ]);
    }
}
