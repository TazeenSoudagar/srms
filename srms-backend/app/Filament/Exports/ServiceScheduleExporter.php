<?php

namespace App\Filament\Exports;

use App\Models\ServiceSchedule;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ServiceScheduleExporter extends Exporter
{
    protected static ?string $model = ServiceSchedule::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id'),
            ExportColumn::make('serviceRequest.request_number')
                ->label('Request Number'),
            ExportColumn::make('customer.name')
                ->label('Customer'),
            ExportColumn::make('engineer.name')
                ->label('Engineer'),
            ExportColumn::make('scheduled_at'),
            ExportColumn::make('completed_at'),
            ExportColumn::make('status'),
            ExportColumn::make('location'),
            ExportColumn::make('estimated_duration_minutes'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your schedule export has completed and ' . number_format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
