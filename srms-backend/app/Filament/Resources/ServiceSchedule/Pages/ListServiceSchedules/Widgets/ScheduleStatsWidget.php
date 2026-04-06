<?php

namespace App\Filament\Resources\ServiceSchedule\Pages\ListServiceSchedules\Widgets;

use App\Models\ServiceSchedule;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ScheduleStatsWidget extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $upcomingCount = ServiceSchedule::where('scheduled_at', '>', now())
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        $completedThisMonth = ServiceSchedule::where('status', 'completed')
            ->whereMonth('completed_at', now()->month)
            ->whereYear('completed_at', now()->year)
            ->count();
        // dd($completedThisMonth);

        $pendingConfirmations = ServiceSchedule::where('status', 'pending')->count();

        $inProgress = ServiceSchedule::where('status', 'in_progress')->count();

        return [
            Stat::make('Upcoming Appointments', $upcomingCount)
                ->description('Pending & Confirmed')
                ->icon('heroicon-o-calendar')
                ->color('info'),

            Stat::make('Completed This Month', $completedThisMonth)
                ->description(now()->format('F Y'))
                ->icon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Pending Confirmations', $pendingConfirmations)
                ->description('Awaiting confirmation')
                ->icon('heroicon-o-clock')
                ->color('warning'),

            Stat::make('In Progress', $inProgress)
                ->description('Currently active')
                ->icon('heroicon-o-arrow-path')
                ->color('primary'),
        ];
    }
}
