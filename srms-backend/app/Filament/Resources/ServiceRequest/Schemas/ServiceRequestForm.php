<?php
namespace App\Filament\Resources\ServiceRequest\Schemas;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ServiceRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('request_number')
                    ->disabled()
                    ->dehydrated()
                    ->columnSpan(1),
                Select::make('service_id')
                    ->relationship('service', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->columnSpan(1),
                TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->columnSpanFull(),
                Textarea::make('description')
                    ->rows(6)
                    ->columnSpanFull(),
                Select::make('status')
                    ->options(RequestStatus::options())
                    ->required()
                    ->default('open')
                    ->columnSpan(1),
                Select::make('priority')
                    ->options(RequestPriority::options())
                    ->required()
                    ->default('low')
                    ->columnSpan(1),
                Select::make('created_by')
                    ->relationship('createdBy', 'first_name')
                    ->disabled()
                    ->dehydrated()
                    ->columnSpan(1),
                Select::make('assigned_to')
                    ->relationship('assignedTo', 'first_name', fn($query) => $query->whereHas('role', fn($q) => $q->where('name', 'Support Engineer')))
                    ->searchable()

                    ->preload()
                    ->columnSpan(1),
                DatePicker::make('due_date')
                    ->columnSpan(1),
                Toggle::make('is_active')
                    ->default(true)
                    ->required()
                    ->columnSpan(1),
            ]);
    }
}
