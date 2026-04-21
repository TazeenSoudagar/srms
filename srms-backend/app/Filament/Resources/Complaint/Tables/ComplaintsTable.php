<?php

namespace App\Filament\Resources\Complaint\Tables;

use App\Enums\ComplaintStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ComplaintsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('complaint_number')
                    ->label('Complaint #')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),
                TextColumn::make('serviceRequest.request_number')
                    ->label('Service Request #')
                    ->searchable()
                    ->sortable()
                    ->color('primary'),
                TextColumn::make('createdBy.name')
                    ->label('Customer')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable(),
                TextColumn::make('assignedEngineer.name')
                    ->label('Assigned Engineer')
                    ->searchable(['first_name', 'last_name'])
                    ->placeholder('Unassigned')
                    ->toggleable(),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ComplaintStatus::getLabel($state->value ?? $state))
                    ->color(fn ($state): string => match ($state->value ?? $state) {
                        'pending' => 'danger',
                        'in_progress' => 'warning',
                        'closed' => 'success',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('description')
                    ->limit(60)
                    ->wrap()
                    ->toggleable(),
                TextColumn::make('closed_at')
                    ->label('Closed At')
                    ->dateTime('M j, Y')
                    ->placeholder('—')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Raised At')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options(ComplaintStatus::options()),
                SelectFilter::make('assigned_engineer_id')
                    ->label('Engineer')
                    ->relationship('assignedEngineer', 'first_name')
                    ->searchable()
                    ->preload(),
                Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('created_from')
                            ->label('From'),
                        \Filament\Forms\Components\DatePicker::make('created_until')
                            ->label('Until'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['created_from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                        ->when($data['created_until'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
