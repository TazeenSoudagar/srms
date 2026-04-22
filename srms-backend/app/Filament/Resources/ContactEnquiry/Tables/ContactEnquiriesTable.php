<?php

namespace App\Filament\Resources\ContactEnquiry\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ContactEnquiriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('enquiry_number')
                    ->label('Enquiry #')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->searchable()
                    ->copyable()
                    ->color('primary'),
                TextColumn::make('subject')
                    ->searchable()
                    ->limit(40),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'new'     => 'New',
                        'read'    => 'Read',
                        'replied' => 'Replied',
                        default   => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'new'     => 'danger',
                        'read'    => 'warning',
                        'replied' => 'success',
                        default   => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Submitted At')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->since(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'new'     => 'New',
                        'read'    => 'Read',
                        'replied' => 'Replied',
                    ]),
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from')->label('From'),
                        DatePicker::make('created_until')->label('Until'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['created_from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                        ->when($data['created_until'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
