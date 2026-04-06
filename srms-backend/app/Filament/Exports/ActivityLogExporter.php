<?php

namespace App\Filament\Exports;

use App\Models\ActivityLog;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ActivityLogExporter extends Exporter
{
    protected static ?string $model = ActivityLog::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id')
                ->label('ID'),
            ExportColumn::make('user.name')
                ->label('User'),
            ExportColumn::make('user.role.name')
                ->label('User Role'),
            ExportColumn::make('action'),
            ExportColumn::make('loggable_type')
                ->label('Model Type'),
            ExportColumn::make('loggable_id')
                ->label('Model ID'),
            ExportColumn::make('details')
                ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state) : ''),
            ExportColumn::make('created_at')
                ->label('Timestamp'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your activity log export has completed and ' . number_format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
