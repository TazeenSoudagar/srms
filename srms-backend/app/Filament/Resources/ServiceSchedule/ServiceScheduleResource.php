<?php

namespace App\Filament\Resources\ServiceSchedule;

use App\Filament\Resources\ServiceSchedule\Pages\CreateServiceSchedule;
use App\Filament\Resources\ServiceSchedule\Pages\EditServiceSchedule;
use App\Filament\Resources\ServiceSchedule\Pages\ListServiceSchedules;
use App\Filament\Resources\ServiceSchedule\Pages\ViewServiceSchedule;
use App\Filament\Resources\ServiceSchedule\Schemas\ServiceScheduleForm;
use App\Filament\Resources\ServiceSchedule\Schemas\ServiceScheduleInfolist;
use App\Filament\Resources\ServiceSchedule\Tables\ServiceSchedulesTable;
use App\Models\ServiceSchedule;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class ServiceScheduleResource extends Resource
{
    protected static ?string $model = ServiceSchedule::class;

    protected static ?int $navigationSort = 1;

    protected static BackedEnum|string|null $navigationIcon = Heroicon::OutlinedCalendar;

    protected static UnitEnum|string|null $navigationGroup = 'Scheduling';

    protected static ?string $recordTitleAttribute = 'id';

    protected static ?string $navigationLabel = 'Service Schedules';

    protected static ?string $pluralModelLabel = 'Service Schedules';

    public static function form(Schema $schema): Schema
    {
        return ServiceScheduleForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ServiceScheduleInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ServiceSchedulesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListServiceSchedules::route('/'),
            'create' => CreateServiceSchedule::route('/create'),
            'view' => ViewServiceSchedule::route('/{record}'),
            'edit' => EditServiceSchedule::route('/{record}/edit'),
        ];
    }
}
