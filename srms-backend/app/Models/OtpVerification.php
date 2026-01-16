<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtpVerification extends Model
{
    protected $fillable = [
        'otp',
        'email',
        'user_id',
        'type',
        'expires_at',
        'is_verified',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'is_verified' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get valid (unverified and not expired) OTPs
     */
    public function scopeValid($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_verified', false)
            ->where('expires_at', '>', now());
    }

    /**
     * Scope to get OTPs for a specific email
     */
    public function scopeForEmail($query, string $email): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('email', $email);
    }

    /**
     * Scope to get unverified OTPs
     */
    public function scopeUnverified($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_verified', false);
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Mark OTP as verified
     */
    public function markAsVerified(): bool
    {
        $this->is_verified = true;
        $this->verified_at = now();

        return $this->save();
    }
}
