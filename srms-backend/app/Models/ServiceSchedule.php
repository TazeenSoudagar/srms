<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_request_id',
        'customer_id',
        'engineer_id',
        'scheduled_at',
        'completed_at',
        'status',
        'notes',
        'location',
        'estimated_duration_minutes',
        'reminder_sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'estimated_duration_minutes' => 'integer',
    ];

    protected $appends = ['hashed_id'];

    /**
     * Get the hashed ID for the schedule.
     */
    protected function hashedId(): Attribute
    {
        return Attribute::make(
            get: fn () => \Vinkla\Hashids\Facades\Hashids::encode($this->id),
        );
    }

    /**
     * Get the service request associated with this schedule.
     */
    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    /**
     * Get the customer associated with this schedule.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the engineer assigned to this schedule.
     */
    public function engineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'engineer_id');
    }

    /**
     * Scope a query to only include schedules for a specific engineer.
     */
    public function scopeForEngineer($query, $engineerId)
    {
        return $query->where('engineer_id', $engineerId);
    }

    /**
     * Scope a query to only include schedules for a specific customer.
     */
    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope a query to only include schedules with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include upcoming schedules.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
            ->whereIn('status', ['pending', 'confirmed']);
    }

    /**
     * Scope a query to only include schedules within a date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_at', [$startDate, $endDate]);
    }

    /**
     * Check if the schedule is editable.
     */
    public function isEditable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Check if the schedule is cancellable.
     */
    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed'])
            && $this->scheduled_at->isFuture();
    }

    /**
     * Check if reminder should be sent.
     */
    public function shouldSendReminder(): bool
    {
        return is_null($this->reminder_sent_at)
            && $this->status === 'confirmed'
            && $this->scheduled_at->subHours(24)->isPast()
            && $this->scheduled_at->isFuture();
    }
}
