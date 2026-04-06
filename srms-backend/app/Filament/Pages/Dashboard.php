<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static BackedEnum|string|null $navigationIcon = 'heroicon-o-home';

    protected static ?int $navigationSort = -1;

    protected string $view = 'filament.pages.dashboard';

    public function getWidgets(): array
    {
        return [
            \App\Filament\Widgets\StatsOverviewWidget::class,
            \App\Filament\Widgets\ServiceRequestsTrendChart::class,
            \App\Filament\Widgets\RequestsByPriorityChart::class,
            \App\Filament\Widgets\TopPerformingEngineersChart::class,
            // \App\Filament\Widgets\CategoryPerformanceChart::class,
            \App\Filament\Widgets\RecentServiceRequestsTable::class,
            \App\Filament\Widgets\OverdueRequestsTable::class,
            \App\Filament\Widgets\PendingAssignmentsTable::class,
            \App\Filament\Widgets\EngineerWorkloadWidget::class,
            // \App\Filament\Widgets\PopularServicesWidget::class,
            // \App\Filament\Widgets\ActivityFeedWidget::class,
        ];
    }

    public function getColumns(): int | array
    {
        return 2;
    }
}
