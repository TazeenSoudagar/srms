<?php

namespace App\Filament\Resources\Service;

use App\Filament\Resources\Service\Pages\CreateService;
use App\Filament\Resources\Service\Pages\EditService;
use App\Filament\Resources\Service\Pages\ListServices;
use App\Filament\Resources\Service\Pages\ViewService;
use App\Filament\Resources\Service\Schemas\ServiceForm;
use App\Filament\Resources\Service\Schemas\ServiceInfolist;
use App\Filament\Resources\Service\Tables\ServicesTable;
use App\Models\Service;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    protected static ?int $navigationSort = 2;

    protected static BackedEnum|string|null $navigationIcon = Heroicon::OutlinedWrenchScrewdriver;

    protected static UnitEnum|string|null $navigationGroup = 'Service Management';

    protected static ?string $recordTitleAttribute = 'name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'description'];
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Category' => $record->category?->name,
            'Price' => $record->base_price ? '₹' . number_format($record->base_price, 2) : '—',
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return ServiceForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ServiceInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ServicesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ServiceRequestsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListServices::route('/'),
            'create' => CreateService::route('/create'),
            'view' => ViewService::route('/{record}'),
            'edit' => EditService::route('/{record}/edit'),
        ];
    }
}
