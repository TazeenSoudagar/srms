<?php

namespace App\Filament\Resources\ServiceRequest;

use App\Filament\Resources\ServiceRequest\Pages\CreateServiceRequest;
use App\Filament\Resources\ServiceRequest\Pages\EditServiceRequest;
use App\Filament\Resources\ServiceRequest\Pages\ListServiceRequests;
use App\Filament\Resources\ServiceRequest\Pages\ViewServiceRequest;
use App\Filament\Resources\ServiceRequest\Schemas\ServiceRequestForm;
use App\Filament\Resources\ServiceRequest\Schemas\ServiceRequestInfolist;
use App\Filament\Resources\ServiceRequest\Tables\ServiceRequestsTable;
use App\Models\ServiceRequest;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static ?int $navigationSort = 1;

    protected static BackedEnum|string|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static UnitEnum|string|null $navigationGroup = 'Requests';

    protected static ?string $recordTitleAttribute = 'request_number';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'open')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['request_number', 'title', 'description'];
    }

    public static function getGlobalSearchResultTitle($record): string
    {
        return "#{$record->request_number}";
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Title' => $record->title,
            'Status' => $record->status,
            'Service' => $record->service?->name,
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return ServiceRequestForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ServiceRequestInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ServiceRequestsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\SchedulesRelationManager::class,
            RelationManagers\CommentsRelationManager::class,
            RelationManagers\MediaRelationManager::class,
            RelationManagers\RatingsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListServiceRequests::route('/'),
            'create' => CreateServiceRequest::route('/create'),
            'view' => ViewServiceRequest::route('/{record}'),
            'edit' => EditServiceRequest::route('/{record}/edit'),
        ];
    }
}
