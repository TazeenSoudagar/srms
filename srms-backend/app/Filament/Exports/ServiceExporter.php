<?php

namespace App\Filament\Exports;

use App\Models\Service;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ServiceExporter extends Exporter
{
    protected static ?string $model = Service::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id'),
            ExportColumn::make('name'),
            ExportColumn::make('description'),
            ExportColumn::make('category.name')
                ->label('Category'),
            ExportColumn::make('base_price'),
            ExportColumn::make('average_duration_minutes'),
            ExportColumn::make('is_active'),
            ExportColumn::make('is_popular'),
            ExportColumn::make('is_trending'),
            ExportColumn::make('view_count'),
            ExportColumn::make('popularity_score'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your service export has completed and ' . number_format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
