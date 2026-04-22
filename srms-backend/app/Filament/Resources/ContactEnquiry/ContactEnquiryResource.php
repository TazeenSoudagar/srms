<?php

namespace App\Filament\Resources\ContactEnquiry;

use App\Filament\Resources\ContactEnquiry\Pages\ListContactEnquiries;
use App\Filament\Resources\ContactEnquiry\Pages\ViewContactEnquiry;
use App\Filament\Resources\ContactEnquiry\Schemas\ContactEnquiryInfolist;
use App\Filament\Resources\ContactEnquiry\Tables\ContactEnquiriesTable;
use App\Models\ContactEnquiry;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class ContactEnquiryResource extends Resource
{
    protected static ?string $model = ContactEnquiry::class;

    protected static ?int $navigationSort = 5;

    protected static BackedEnum|string|null $navigationIcon = 'heroicon-o-envelope';

    protected static UnitEnum|string|null $navigationGroup = 'Support';

    protected static ?string $recordTitleAttribute = 'enquiry_number';

    protected static ?string $navigationLabel = 'Contact Enquiries';

    protected static ?string $pluralModelLabel = 'Contact Enquiries';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'new')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['enquiry_number', 'name', 'email', 'subject'];
    }

    public static function infolist(Schema $schema): Schema
    {
        return ContactEnquiryInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ContactEnquiriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListContactEnquiries::route('/'),
            'view'  => ViewContactEnquiry::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return false;
    }
}
