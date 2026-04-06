<?php

namespace App\Filament\Widgets;

use App\Models\ServiceRequest;
use Filament\Widgets\ChartWidget;

class RequestsByPriorityChart extends ChartWidget
{
    protected ?string $heading = 'Requests by Priority';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $lowCount = ServiceRequest::where('priority', 'low')->count();
        $mediumCount = ServiceRequest::where('priority', 'medium')->count();
        $highCount = ServiceRequest::where('priority', 'high')->count();

        return [
            'datasets' => [
                [
                    'label' => 'Requests by Priority',
                    'data' => [$lowCount, $mediumCount, $highCount],
                    'backgroundColor' => [
                        '#10b981', // green for low
                        '#f59e0b', // amber for medium
                        '#ef4444', // red for high
                    ],
                ],
            ],
            'labels' => ['Low Priority', 'Medium Priority', 'High Priority'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
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
        ];
    }
}
