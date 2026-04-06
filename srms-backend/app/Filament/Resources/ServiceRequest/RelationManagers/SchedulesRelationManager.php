<?php

namespace App\Filament\Resources\ServiceRequest\RelationManagers;

use App\Models\User;
use Filament\Actions;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class SchedulesRelationManager extends RelationManager
{
    protected static string $relationship = 'schedules';

    protected static ?string $title = 'Service Schedules';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('engineer_id')
                    ->label('Engineer')
                    ->options(function () {
                        return User::whereHas('role', function ($query) {
                            $query->where('name', 'Support Engineer');
                        })->pluck('first_name', 'id');
                    })
                    ->required()
                    ->searchable()
                    ->preload()
                    ->default(fn ($livewire) => $livewire->ownerRecord->assigned_to ?? null),
                DateTimePicker::make('scheduled_at')
                    ->label('Scheduled Date & Time')
                    ->required()
                    ->native(false)
                    ->minDate(now())
                    ->seconds(false),
                Select::make('status')
                    ->required()
                    ->default('pending')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'in_progress' => 'In Progress',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->native(false),
                TextInput::make('estimated_duration_minutes')
                    ->label('Estimated Duration (minutes)')
                    ->numeric()
                    ->minValue(0)
                    ->default(60)
                    ->suffix('min'),
                Textarea::make('location')
                    ->rows(2)
                    ->columnSpanFull()
                    ->placeholder('Enter service location address'),
                RichEditor::make('notes')
                    ->columnSpanFull()
                    ->toolbarButtons([
                        'bold',
                        'italic',
                        'bulletList',
                        'orderedList',
                        'link',
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('scheduled_at')
            ->columns([
                Tables\Columns\TextColumn::make('engineer.name')
                    ->label('Engineer')
                    ->searchable(['first_name', 'last_name']),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Scheduled For')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->color(fn ($record) => $record->scheduled_at->isPast() && $record->status !== 'completed' ? 'danger' : 'primary'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'in_progress' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('location')
                    ->limit(30)
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('estimated_duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} min" : '—')
                    ->toggleable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['customer_id'] = $this->ownerRecord->created_by;
                        return $data;
                    }),
            ])
            ->actions([
                Actions\ViewAction::make(),
                Actions\EditAction::make(),
                Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->emptyStateHeading('No Schedules')
            ->emptyStateDescription('No appointments have been scheduled for this request yet.');
    }
}
