<?php

namespace App\Filament\Exports;

use App\Models\ServiceRequest;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ServiceRequestExporter extends Exporter
{
    protected static ?string $model = ServiceRequest::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('request_number')
                ->label('Request Number'),
            ExportColumn::make('title'),
            ExportColumn::make('description'),
            ExportColumn::make('service.name')
                ->label('Service'),
            ExportColumn::make('createdBy.name')
                ->label('Customer'),
            ExportColumn::make('schedules.0.engineer.name')
                ->label('Assigned Engineer'),
            ExportColumn::make('status'),
            ExportColumn::make('priority'),
            ExportColumn::make('due_date'),
            ExportColumn::make('closed_at'),
            ExportColumn::make('created_at'),
            ExportColumn::make('updated_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your service request export has completed and ' . number_format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
