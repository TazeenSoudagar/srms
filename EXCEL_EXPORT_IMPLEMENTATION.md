# Excel Export Implementation Guide

## Overview
This document describes the implementation of Excel export functionality using the `pxlrbt/filament-excel` plugin for the SRMS Activity Logs feature.

## Installation

### 1. Package Installation
The Filament Excel plugin has been installed via Composer:

```bash
composer require pxlrbt/filament-excel
```

**Package Version:** v3.6
**Location in composer.json:** Line 14

### 2. Configuration
No additional configuration is required. The plugin works out of the box with Filament 4.0.

## Implementation Details

### Modified Files

#### 1. ActivityLogsTable.php
**File:** `srms-backend/app/Filament/Resources/ActivityLog/Tables/ActivityLogsTable.php`

**Changes:**
- Added import for `pxlrbt\FilamentExcel\Actions\Tables\ExportAction`
- Added import for `pxlrbt\FilamentExcel\Exports\ExcelExport`
- Updated the `toolbarActions` method to use the Excel plugin

**Export Configuration:**
```php
->toolbarActions([
    ExportAction::make()
        ->exports([
            ExcelExport::make()
                ->fromTable()
                ->withFilename(fn () => 'activity-logs-' . date('Y-m-d-His'))
                ->withWriterType(\Maatwebsite\Excel\Excel::XLSX),
        ]),
])
```

**Features:**
- Exports all visible table columns
- Dynamic filename with timestamp (format: `activity-logs-YYYY-MM-DD-HHmmss`)
- XLSX format (Excel 2007+)
- Respects table filters and searches
- Includes column headers
- Proper data formatting

### Exported Columns
The following columns are included in the Excel export:

1. **User** - Full name of the user who performed the action
2. **Role** - User's role (Admin, Support Engineer, Client)
3. **Action** - Type of action (created, updated, deleted, etc.)
4. **Model** - The model type that was affected
5. **ID** - The ID of the affected model
6. **Details Preview** - JSON formatted details of the action
7. **Timestamp** - Date and time of the action

## Testing

### Prerequisites
1. Ensure the Laravel development server is running:
   ```bash
   cd srms-backend
   php artisan serve
   ```

2. Ensure the database is seeded with test data:
   ```bash
   php artisan migrate:fresh --seed
   ```

3. Admin credentials (from UserSeeder):
   - Email: `admin@gmail.com`
   - Password: `test1234`

### Manual Testing

#### Test 1: Basic Export
1. Navigate to `http://localhost:8000/admin/login`
2. Login with admin credentials
3. Navigate to **System** → **Activity Logs**
4. Click the **"Export Activity Logs"** button in the toolbar
5. The export should start and download a file named `activity-logs-YYYY-MM-DD-HHmmss.xlsx`
6. Open the file in Excel/LibreOffice to verify:
   - All columns are present
   - Data is properly formatted
   - Headers are correct
   - Timestamps are readable

#### Test 2: Filtered Export
1. Navigate to **Activity Logs**
2. Apply a filter (e.g., Action = "created")
3. Click **"Export Activity Logs"**
4. Verify the exported file contains only filtered records

#### Test 3: Searched Export
1. Navigate to **Activity Logs**
2. Use the search box to search for a specific user or action
3. Click **"Export Activity Logs"**
4. Verify the exported file contains only searched records

### Automated Testing with Playwright

#### Setup
1. Install Playwright dependencies:
   ```bash
   cd srms-backend
   npm install -D @playwright/test @types/node
   npx playwright install chromium
   ```

2. Ensure the Laravel server is running (the test will start it automatically if not)

#### Running Tests
```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed
```

#### Test Files
- **Test Spec:** `srms-backend/tests/playwright/activity-log-export.spec.ts`
- **Config:** `srms-backend/playwright.config.ts`

#### Test Cases
1. **Export Button Visibility** - Verifies the export button is visible on the Activity Logs page
2. **Basic Export** - Tests the full export flow and verifies file download
3. **Filtered Export** - Tests export with filters applied

#### Test Artifacts
- **Screenshots:** `srms-backend/tests/screenshots/`
- **Downloads:** `srms-backend/tests/downloads/`
- **HTML Report:** Generated after test run

### Expected Behavior

#### Success Criteria
✓ Export button is visible on the Activity Logs page
✓ Clicking export opens a modal/dropdown
✓ Export generates an XLSX file
✓ Filename follows format: `activity-logs-YYYY-MM-DD-HHmmss.xlsx`
✓ File contains all visible columns
✓ File contains all filtered/searched records
✓ Data is properly formatted and readable
✓ Download completes without errors

#### Common Issues

1. **Export button not visible**
   - Ensure the plugin is installed: `composer show pxlrbt/filament-excel`
   - Clear cache: `php artisan optimize:clear`
   - Verify imports in ActivityLogsTable.php

2. **Empty export**
   - Ensure there is data in the activity_logs table
   - Check filters - remove all filters to see all data

3. **File not downloading**
   - Check browser download settings
   - Check file permissions in storage directory
   - Check Laravel logs: `storage/logs/laravel.log`

## Additional Features

### Customization Options
The Excel export can be customized with additional options:

```php
ExcelExport::make()
    ->fromTable()
    ->withFilename('custom-filename')
    ->withWriterType(\Maatwebsite\Excel\Excel::CSV) // For CSV format
    ->withColumns([...]) // Custom column selection
    ->modifyQueryUsing(fn ($query) => $query->limit(1000)) // Limit records
```

### Other Resources
The same export functionality can be added to other resources by following the same pattern:

1. Import the necessary classes
2. Add `ExportAction` to `toolbarActions`
3. Configure `ExcelExport` with desired options

Example resources that could benefit:
- Service Requests
- Users
- Services
- Categories
- Ratings
- Service Schedules

## Plugin Documentation
- **GitHub:** https://github.com/pxlrbt/filament-excel
- **Plugin Page:** https://filamentphp.com/plugins/pxlrbt-excel

## Troubleshooting

### Clear Cache
```bash
cd srms-backend
php artisan optimize:clear
php artisan config:clear
php artisan view:clear
```

### Verify Installation
```bash
composer show pxlrbt/filament-excel
```

### Check Logs
```bash
tail -f storage/logs/laravel.log
```

## Conclusion
The Excel export functionality has been successfully implemented for Activity Logs using the Filament Excel plugin. The feature is production-ready and can be extended to other resources as needed.
