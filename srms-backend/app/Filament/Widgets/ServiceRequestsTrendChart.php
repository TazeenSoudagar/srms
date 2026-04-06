<?php

namespace App\Filament\Widgets;

use App\Models\ServiceRequest;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class ServiceRequestsTrendChart extends ChartWidget
{
    protected ?string $heading = 'Service Requests Trend (Last 30 Days)';

    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $days = collect(range(29, 0))->map(fn ($day) => now()->subDays($day)->format('M d'));

        $openData = [];
        $inProgressData = [];
        $closedData = [];
        $cancelledData = [];

        foreach (range(29, 0) as $day) {
            $date = now()->subDays($day)->toDateString();

            $openData[] = ServiceRequest::where('status', 'open')
                ->whereDate('created_at', $date)
                ->count();

            $inProgressData[] = ServiceRequest::where('status', 'in_progress')
                ->whereDate('created_at', $date)
                ->count();

            $closedData[] = ServiceRequest::whereIn('status', ['resolved', 'closed'])
                ->whereDate('updated_at', $date)
                ->count();

            $cancelledData[] = ServiceRequest::where('status', 'cancelled')
                ->whereDate('updated_at', $date)
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Open',
                    'data' => $openData,
                    'borderColor' => '#3b82f6',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                ],
                [
                    'label' => 'In Progress',
                    'data' => $inProgressData,
                    'borderColor' => '#f59e0b',
                    'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                ],
                [
                    'label' => 'Closed',
                    'data' => $closedData,
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                ],
                [
                    'label' => 'Cancelled',
                    'data' => $cancelledData,
                    'borderColor' => '#ef4444',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.1)',
                ],
            ],
            'labels' => $days->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => true,
                    'position' => 'bottom',
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                ],
            ],
        ];
    }
}
