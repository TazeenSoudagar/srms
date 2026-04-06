<?php

namespace App\Filament\Widgets;

use App\Models\EngineerRatingAggregate;
use App\Models\User;
use Filament\Widgets\ChartWidget;

class TopPerformingEngineersChart extends ChartWidget
{
    protected ?string $heading = 'Top 10 Performing Engineers by Rating';

    protected static ?int $sort = 4;

    protected function getData(): array
    {
        $topEngineers = EngineerRatingAggregate::with('engineer')
            ->orderBy('average_rating', 'desc')
            ->limit(10)
            ->get();

        $labels = $topEngineers->map(fn ($agg) => $agg->engineer
            ? $agg->engineer->first_name . ' ' . $agg->engineer->last_name
            : 'Unknown')->toArray();

        $data = $topEngineers->pluck('average_rating')->toArray();

        return [
            'datasets' => [
                [
                    'label' => 'Average Rating',
                    'data' => $data,
                    'backgroundColor' => '#f59e0b',
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
                    'max' => 5,
                ],
            ],
        ];
    }
}
