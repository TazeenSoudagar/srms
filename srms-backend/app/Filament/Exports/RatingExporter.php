<?php

namespace App\Filament\Exports;

use App\Models\Rating;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class RatingExporter extends Exporter
{
    protected static ?string $model = Rating::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id'),
            ExportColumn::make('serviceRequest.request_number')
                ->label('Request Number'),
            ExportColumn::make('user.name')
                ->label('Customer'),
            ExportColumn::make('engineer.name')
                ->label('Engineer'),
            ExportColumn::make('service.name')
                ->label('Service'),
            ExportColumn::make('rating'),
            ExportColumn::make('professionalism_rating'),
            ExportColumn::make('timeliness_rating'),
            ExportColumn::make('quality_rating'),
            ExportColumn::make('review'),
            ExportColumn::make('is_anonymous'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your rating export has completed and ' . number_format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
