# Export Functionality Implementation Guide

## Exporters Created

All exporters have been created in `app/Filament/Exports/`:
1. ✅ ActivityLogExporter.php
2. ✅ ServiceRequestExporter.php
3. ✅ UserExporter.php
4. ✅ ServiceExporter.php
5. ✅ CategoryExporter.php
6. ✅ RatingExporter.php
7. ✅ ServiceScheduleExporter.php

## Adding Export Actions to Tables

To add export functionality to each table, add the ExportAction to the toolbarActions. Here's the pattern:

### Example - Add to ServiceRequestsTable.php:

```php
use Filament\Actions\ExportAction;

// In the toolbarActions section:
->toolbarActions([
    ExportAction::make()
        ->exporter(\App\Filament\Exports\ServiceRequestExporter::class),
    BulkActionGroup::make([
        DeleteBulkAction::make(),
    ]),
])
```

### Files to Update:

1. **ServiceRequest/Tables/ServiceRequestsTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\ServiceRequestExporter::class)`

2. **Users/Tables/UsersTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\UserExporter::class)`

3. **Service/Tables/ServicesTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\ServiceExporter::class)`

4. **Category/Tables/CategoriesTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\CategoryExporter::class)`

5. **Rating/Tables/RatingsTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\RatingExporter::class)`

6. **ServiceSchedule/Tables/ServiceSchedulesTable.php**
   - Add: `ExportAction::make()->exporter(\App\Filament\Exports\ServiceScheduleExporter::class)`

## Import Statement Required

Add this import at the top of each table file:
```php
use Filament\Actions\ExportAction;
```

## Export Queue Configuration

Exports in Filament 4 are queued by default. Ensure your queue worker is running:

```bash
php artisan queue:work
```

For development, you can use sync queue driver in .env:
```env
QUEUE_CONNECTION=sync
```

## Export Files Location

Exported files are stored in `storage/app/filament-exports/` by default.

## PDF Report Generation (Future Enhancement)

For PDF reports of service requests, you can use packages like:
- `barryvdh/laravel-dompdf`
- `spatie/laravel-pdf`

Create a custom action in ServiceRequestResource:

```php
use Filament\Actions\Action;

// In resource actions:
Action::make('downloadPdf')
    ->label('Download PDF')
    ->icon('heroicon-o-document-arrow-down')
    ->action(function ($record) {
        // Generate PDF logic here
        $pdf = \PDF::loadView('pdf.service-request', ['request' => $record]);
        return response()->streamDownload(
            fn () => print($pdf->output()),
            "service-request-{$record->request_number}.pdf"
        );
    })
```

## Engineer Performance Report (Future Enhancement)

Create a custom Filament page for engineer performance reports with filters for date range, engineer, etc.

Location: `app/Filament/Pages/EngineerPerformanceReport.php`

Include metrics:
- Total requests handled
- Average completion time
- Average rating
- Request status distribution
- Customer satisfaction trends

## Status

✅ All exporters created
⏳ Export actions need to be added to table files (manual step or run migrations)
⏳ PDF generation (optional future enhancement)
⏳ Engineer performance reports (optional future enhancement)
