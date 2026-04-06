<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ServiceRequest\ServiceRequestResource;
use App\Models\Rating;
use App\Models\ServiceRequest;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalRequests = ServiceRequest::count();
        $openRequests = ServiceRequest::where('status', 'open')->count();
        $inProgressRequests = ServiceRequest::where('status', 'in_progress')->count();

        $completedThisMonth = ServiceRequest::whereIn('status', ['resolved', 'closed'])
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();

        $cancelledRequests = ServiceRequest::where('status', 'cancelled')->count();
        $averageRating = Rating::avg('rating') ?? 0;

        // Calculate trend for total requests (compare with last month)
        $lastMonthRequests = ServiceRequest::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $thisMonthRequests = ServiceRequest::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $trend = $lastMonthRequests > 0
            ? round((($thisMonthRequests - $lastMonthRequests) / $lastMonthRequests) * 100, 1)
            : 0;

        return [
            Stat::make('Total Service Requests', $totalRequests)
                ->description(($trend >= 0 ? '+' : '') . $trend . '% from last month')
                ->descriptionIcon($trend >= 0 ? 'heroicon-o-arrow-trending-up' : 'heroicon-o-arrow-trending-down')
                ->color($trend >= 0 ? 'success' : 'danger')
                ->icon('heroicon-o-clipboard-document-list'),

            Stat::make('Open Requests', $openRequests)
                ->description('Awaiting assignment')
                ->color('info')
                ->icon('heroicon-o-folder-open')
                ->url(ServiceRequestResource::getUrl('index', ['tableFilters' => ['status' => ['value' => 'open']]]))
                ->extraAttributes(['class' => 'cursor-pointer']),

            Stat::make('In Progress', $inProgressRequests)
                ->description('Currently being worked on')
                ->color('warning')
                ->icon('heroicon-o-arrow-path')
                ->url(ServiceRequestResource::getUrl('index', ['tableFilters' => ['status' => ['value' => 'in_progress']]]))
                ->extraAttributes(['class' => 'cursor-pointer']),

            Stat::make('Completed This Month', $completedThisMonth)
                ->description(now()->format('F Y'))
                ->color('success')
                ->icon('heroicon-o-check-circle'),

            Stat::make('Cancelled Requests', $cancelledRequests)
                ->description(sprintf('%.1f%% cancellation rate', $totalRequests > 0 ? ($cancelledRequests / $totalRequests * 100) : 0))
                ->color('danger')
                ->icon('heroicon-o-x-circle'),

            Stat::make('Average Rating', number_format($averageRating, 2))
                ->description(str_repeat('⭐', (int) round($averageRating)))
                ->color('warning')
                ->icon('heroicon-o-star'),
        ];
    }
}
