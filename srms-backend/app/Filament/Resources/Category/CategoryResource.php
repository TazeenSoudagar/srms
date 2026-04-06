<?php

namespace App\Filament\Resources\Category;

use App\Filament\Resources\Category\Pages\CreateCategory;
use App\Filament\Resources\Category\Pages\EditCategory;
use App\Filament\Resources\Category\Pages\ListCategories;
use App\Filament\Resources\Category\Pages\ViewCategory;
use App\Filament\Resources\Category\Schemas\CategoryForm;
use App\Filament\Resources\Category\Schemas\CategoryInfolist;
use App\Filament\Resources\Category\Tables\CategoriesTable;
use App\Models\Category;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?int $navigationSort = 1;

    protected static BackedEnum|string|null $navigationIcon = Heroicon::OutlinedRectangleGroup;

    protected static UnitEnum|string|null $navigationGroup = 'Service Management';

    protected static ?string $recordTitleAttribute = 'name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'slug', 'description'];
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Slug' => $record->slug,
            'Services' => $record->services_count ?? 0,
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return CategoryForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CategoryInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CategoriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ServicesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCategories::route('/'),
            'create' => CreateCategory::route('/create'),
            'view' => ViewCategory::route('/{record}'),
            'edit' => EditCategory::route('/{record}/edit'),
        ];
    }
}
