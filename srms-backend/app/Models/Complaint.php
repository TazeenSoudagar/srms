<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ComplaintStatus;
use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Complaint extends Model
{
    use HasFactory, HasHashidsRouteBinding;

    protected $fillable = [
        'complaint_number',
        'service_request_id',
        'created_by',
        'assigned_engineer_id',
        'status',
        'description',
        'admin_note',
        'closed_at',
    ];

    protected $casts = [
        'status' => ComplaintStatus::class,
        'closed_at' => 'datetime',
    ];

    protected $appends = ['hashed_id'];

    protected function hashedId(): Attribute
    {
        return Attribute::make(
            get: fn () => \Vinkla\Hashids\Facades\Hashids::encode($this->id),
        );
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedEngineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_engineer_id');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediaable')->where('collection', 'complaints');
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        $roleName = strtolower($user->role?->name ?? '');

        if ($roleName === 'admin') {
            return $query;
        }

        if ($roleName === 'support engineer') {
            return $query->where('assigned_engineer_id', $user->id);
        }

        if ($roleName === 'client') {
            return $query->where('created_by', $user->id);
        }

        return $query->whereRaw('1 = 0');
    }

    public static function generateComplaintNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $prefix = "CMP-{$datePrefix}-";

        $last = self::where('complaint_number', 'like', "{$prefix}%")
            ->orderBy('complaint_number', 'desc')
            ->first();

        $sequence = $last ? ((int) substr($last->complaint_number, -4)) + 1 : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
