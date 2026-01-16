<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ServiceRequest extends Model
{
    use HasFactory, HasHashidsRouteBinding;
    protected $fillable = [
        'request_number',
        'service_id',
        'created_by',
        'title',
        'description',
        'status',
        'priority',
        'assigned_to',
        'due_date',
        'closed_at',
        'updated_by',
        'is_active',
    ];

    protected $casts = [
        'due_date' => 'date',
        'closed_at' => 'datetime',
        'is_active' => 'boolean',
        'status' => RequestStatus::class,
        'priority' => RequestPriority::class,
    ];

    /**
     * Get the service that this request belongs to.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the user who created this request.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user assigned to this request.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who last updated this request.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all comments for this service request.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get all media attachments for this service request.
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediaable');
    }

    /**
     * Get all activity logs for this service request.
     */
    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    /**
     * Scope to filter requests accessible by a user.
     * Admin: all requests
     * Support Engineer: assigned requests
     * Client: own requests
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        $roleName = strtolower($user->role->name ?? '');

        if ($roleName === 'admin') {
            return $query;
        }

        if ($roleName === 'support engineer') {
            return $query->where('assigned_to', $user->id);
        }

        if ($roleName === 'client') {
            return $query->where('created_by', $user->id);
        }

        return $query->whereRaw('1 = 0'); // No access
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by priority.
     */
    public function scopeByPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to filter by assigned engineer.
     */
    public function scopeAssignedTo(Builder $query, int $userId): Builder
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope to filter by creator.
     */
    public function scopeCreatedBy(Builder $query, int $userId): Builder
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeByDateRange(Builder $query, ?string $dateFrom, ?string $dateTo): Builder
    {
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query;
    }

    /**
     * Scope to search by title or description.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('request_number', 'like', "%{$search}%");
        });
    }

    /**
     * Generate a unique request number.
     * Format: SR-YYYYMMDD-XXXX (e.g., SR-20251212-0001)
     */
    public static function generateRequestNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $prefix = "SR-{$datePrefix}-";

        // Get the last request number for today
        $lastRequest = self::where('request_number', 'like', "{$prefix}%")
            ->orderBy('request_number', 'desc')
            ->first();

        if ($lastRequest) {
            // Extract the sequence number
            $sequence = (int) substr($lastRequest->request_number, -4);
            $sequence++;
        } else {
            $sequence = 1;
        }

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
