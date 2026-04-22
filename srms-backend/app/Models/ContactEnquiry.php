<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactEnquiry extends Model
{
    protected $fillable = [
        'enquiry_number',
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'admin_note',
    ];

    public static function generateEnquiryNumber(): string
    {
        $prefix = 'ENQ';
        $date = now()->format('Ymd');
        $last = static::whereDate('created_at', today())
            ->orderByDesc('id')
            ->value('enquiry_number');

        $sequence = 1;
        if ($last) {
            $parts = explode('-', $last);
            $sequence = (int) end($parts) + 1;
        }

        return $prefix . '-' . $date . '-' . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
