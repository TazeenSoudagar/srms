<?php

namespace App\Filament\Resources\ServiceSchedule\Concerns;

use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Section;

/**
 * Shared logic for ServiceSchedule pricing across pages and relation managers.
 */
trait HandlesSchedulePricing
{
    /**
     * The three pricing TextInput fields to embed in any schedule form.
     */
    public static function pricingFields(): array
    {
        return [
            TextInput::make('actual_price')
                ->label('Actual Price (₹)')
                ->numeric()
                ->minValue(0)
                ->prefix('₹')
                ->placeholder('0.00')
                ->helperText('Required when confirming. GST (18%) is auto-calculated.'),
            TextInput::make('gst_rate')
                ->label('GST Rate (%)')
                ->numeric()
                ->default(18)
                ->suffix('%')
                ->disabled()
                ->dehydrated(false)
                ->helperText('Auto-applied (18%)'),
            TextInput::make('total_amount')
                ->label('Total Amount (₹)')
                ->prefix('₹')
                ->disabled()
                ->dehydrated(false)
                ->helperText('Price + GST'),
        ];
    }

    /**
     * Validate status/price rules and compute GST fields.
     * Returns mutated $data, or halts (via $halt callback) on validation failure.
     *
     * @param  array<string,mixed>  $data
     * @param  callable             $halt  — callable that stops the save (e.g. $this->halt())
     */
    public static function applyPricingMutation(array $data, callable $halt): array
    {
        $status = $data['status'] ?? null;

        if ($status === 'confirmed' && empty($data['actual_price'])) {
            Notification::make()
                ->title('Actual price is required before confirming a schedule.')
                ->danger()
                ->send();

            $halt();

            return $data;
        }

        if ($status === 'completed' && empty($data['actual_price'])) {
            Notification::make()
                ->title('Actual price is required before marking a schedule as completed.')
                ->danger()
                ->send();

            $halt();

            return $data;
        }

        if (! empty($data['actual_price'])) {
            $actualPrice = (float) $data['actual_price'];
            $gstRate     = 18.00;
            $gstAmount   = round($actualPrice * ($gstRate / 100), 2);

            $data['gst_rate']     = $gstRate;
            $data['gst_amount']   = $gstAmount;
            $data['total_amount'] = round($actualPrice + $gstAmount, 2);
        }

        return $data;
    }
}
