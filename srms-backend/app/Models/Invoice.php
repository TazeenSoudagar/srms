<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'service_request_id',
        'schedule_id',
        'invoice_number',
        'actual_price',
        'gst_rate',
        'gst_amount',
        'total_amount',
        'pdf_path',
        'sent_at',
    ];

    protected $casts = [
        'actual_price' => 'decimal:2',
        'gst_rate'     => 'decimal:2',
        'gst_amount'   => 'decimal:2',
        'total_amount' => 'decimal:2',
        'sent_at'      => 'datetime',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ServiceSchedule::class, 'schedule_id');
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-'.now()->format('Ymd').'-';
        $last = self::where('invoice_number', 'like', "{$prefix}%")
            ->orderBy('invoice_number', 'desc')
            ->first();
        $seq = $last ? ((int) substr($last->invoice_number, -4)) + 1 : 1;

        return $prefix.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }
}
