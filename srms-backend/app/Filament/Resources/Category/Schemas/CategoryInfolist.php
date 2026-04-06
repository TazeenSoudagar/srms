<?php
namespace App\Filament\Resources\Category\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CategoryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Category Details')
                    ->schema([
                        TextEntry::make('name')
                            ->size('large')
                            ->weight('bold'),
                        TextEntry::make('slug')
                            ->copyable()
                            ->color('gray'),
                        TextEntry::make('description')
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull(),

                Section::make('Display Settings')
                    ->schema([
                        TextEntry::make('icon')
                            ->placeholder('Default icon'),
                        TextEntry::make('display_order')
                            ->label('Display Order'),
                        IconEntry::make('is_active')
                            ->label('Status')
                            ->boolean()
                            ->trueIcon('heroicon-o-check-circle')
                            ->falseIcon('heroicon-o-x-circle')
                            ->trueColor('success')
                            ->falseColor('danger'),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Statistics')
                    ->schema([
                        TextEntry::make('services_count')
                            ->counts('services')
                            ->label('Total Services')
                            ->badge(),
                        TextEntry::make('created_at')
                            ->dateTime(),
                        TextEntry::make('updated_at')
                            ->dateTime(),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),
            ]);
    }
}
