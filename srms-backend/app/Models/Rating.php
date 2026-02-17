<?php

namespace App\Models;

use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    use HasFactory, HasHashidsRouteBinding;

    protected $fillable = [
        'service_request_id',
        'user_id',
        'engineer_id',
        'service_id',
        'rating',
        'professionalism_rating',
        'timeliness_rating',
        'quality_rating',
        'review',
        'is_anonymous',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'professionalism_rating' => 'integer',
            'timeliness_rating' => 'integer',
            'quality_rating' => 'integer',
            'is_anonymous' => 'boolean',
        ];
    }

    /**
     * Get the service request that was rated.
     */
    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    /**
     * Get the customer who submitted the rating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the engineer who was rated.
     */
    public function engineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'engineer_id');
    }

    /**
     * Get the service that was rated.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the rating's hashid.
     */
    public function getHashidAttribute(): string
    {
        return app(\App\Services\HashidsService::class)->encode($this->id);
    }
}
