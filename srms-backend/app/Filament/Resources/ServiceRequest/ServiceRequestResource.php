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

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static ?string $recordTitleAttribute = 'request_number';

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
            //
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
