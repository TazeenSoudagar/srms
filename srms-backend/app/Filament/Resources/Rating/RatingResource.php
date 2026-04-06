<?php

namespace App\Filament\Resources\Rating;

use App\Filament\Resources\Rating\Pages\ListRatings;
use App\Filament\Resources\Rating\Pages\ViewRating;
use App\Filament\Resources\Rating\Schemas\RatingInfolist;
use App\Filament\Resources\Rating\Tables\RatingsTable;
use App\Models\Rating;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class RatingResource extends Resource
{
    protected static ?string $model = Rating::class;

    protected static ?int $navigationSort = 2;

    protected static BackedEnum|string|null $navigationIcon = Heroicon::OutlinedStar;

    protected static UnitEnum|string|null $navigationGroup = 'Feedback';

    protected static ?string $recordTitleAttribute = 'id';

    protected static ?string $navigationLabel = 'Ratings & Reviews';

    protected static ?string $pluralModelLabel = 'Ratings & Reviews';

    public static function infolist(Schema $schema): Schema
    {
        return RatingInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return RatingsTable::configure($table);
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
            'index' => ListRatings::route('/'),
            'view' => ViewRating::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false; // Ratings are customer-only actions
    }

    public static function canEdit($record): bool
    {
        return false; // Ratings cannot be edited
    }
}
