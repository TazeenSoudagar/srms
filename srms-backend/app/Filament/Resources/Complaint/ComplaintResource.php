<?php

namespace App\Filament\Resources\Complaint;

use App\Filament\Resources\Complaint\Pages\EditComplaint;
use App\Filament\Resources\Complaint\Pages\ListComplaints;
use App\Filament\Resources\Complaint\Pages\ViewComplaint;
use App\Filament\Resources\Complaint\Schemas\ComplaintForm;
use App\Filament\Resources\Complaint\Schemas\ComplaintInfolist;
use App\Filament\Resources\Complaint\Tables\ComplaintsTable;
use App\Models\Complaint;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class ComplaintResource extends Resource
{
    protected static ?string $model = Complaint::class;

    protected static ?int $navigationSort = 3;

    protected static BackedEnum|string|null $navigationIcon = 'heroicon-o-exclamation-triangle';

    protected static UnitEnum|string|null $navigationGroup = 'Requests';

    protected static ?string $recordTitleAttribute = 'complaint_number';

    protected static ?string $navigationLabel = 'Complaints';

    protected static ?string $pluralModelLabel = 'Complaints';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['complaint_number', 'description'];
    }

    public static function form(Schema $schema): Schema
    {
        return ComplaintForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ComplaintInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ComplaintsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListComplaints::route('/'),
            'view' => ViewComplaint::route('/{record}'),
            'edit' => EditComplaint::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
