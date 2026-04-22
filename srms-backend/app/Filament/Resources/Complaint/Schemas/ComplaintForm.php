<?php

namespace App\Filament\Resources\Complaint\Schemas;

use App\Enums\ComplaintStatus;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ComplaintForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'in_progress' => 'In Progress',
                    ])
                    ->required()
                    ->columnSpan(1),
                Select::make('assigned_engineer_id')
                    ->label('Assign Engineer')
                    ->relationship('assignedEngineer', 'first_name')
                    ->getOptionLabelFromRecordUsing(
                        fn ($record) => $record->first_name . ' ' . $record->last_name
                    )
                    ->searchable()
                    ->preload()
                    ->nullable()
                    ->columnSpan(1),
                Textarea::make('admin_note')
                    ->label('Admin Note (for direct close)')
                    ->rows(4)
                    ->columnSpanFull()
                    ->placeholder('Add a note if closing this complaint directly...'),
            ]);
    }
}
