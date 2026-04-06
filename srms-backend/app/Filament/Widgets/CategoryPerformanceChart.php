<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use Filament\Widgets\ChartWidget;

class CategoryPerformanceChart extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $heading = 'Requests by Category';

    protected static ?int $sort = 5;

    protected function getData(): array
    {
        $categories = Category::withCount('services')
            ->with(['services' => function ($query) {
                $query->withCount('serviceRequests');
            }])
            ->get();

        $labels = [];
        $data = [];

        foreach ($categories as $category) {
            $requestCount = $category->services->sum(fn ($service) => $service->service_requests_count);
            if ($requestCount > 0) {
                $labels[] = $category->name;
                $data[] = $requestCount;
            }
        }

        return [
            'datasets' => [
                [
                    'label' => 'Service Requests',
                    'data' => $data,
                    'backgroundColor' => [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#ec4899',
                        '#14b8a6',
                        '#f97316',
                    ],
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
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
