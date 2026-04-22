<?php

namespace App\Filament\Resources\ContactEnquiry\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ContactEnquiryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Enquiry Details')
                    ->schema([
                        TextEntry::make('enquiry_number')
                            ->label('Enquiry #')
                            ->weight('bold')
                            ->copyable(),
                        TextEntry::make('status')
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
                                'replied' => 'Replied',
                                default   => 'gray',
                            }),
                        TextEntry::make('created_at')
                            ->label('Submitted At')
                            ->dateTime('F j, Y g:i A'),
                        TextEntry::make('subject')
                            ->columnSpanFull(),
                        TextEntry::make('message')
                            ->columnSpanFull()
                            ->prose(),
                    ])
                    ->columns(2)
                    ->columnSpanFull(),

                Section::make('Contact Information')
                    ->schema([
                        TextEntry::make('name')
                            ->weight('bold'),
                        TextEntry::make('email')
                            ->copyable()
                            ->color('primary'),
                        TextEntry::make('phone')
                            ->placeholder('Not provided')
                            ->copyable(),
                    ])
                    ->columns(3)
                    ->columnSpanFull(),

                Section::make('Admin Note')
                    ->schema([
                        TextEntry::make('admin_note')
                            ->label('')
                            ->columnSpanFull()
                            ->placeholder('No note added yet.')
                            ->prose(),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }
}
