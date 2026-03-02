<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory, HasHashidsRouteBinding;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'category_id',
        'icon',
        'average_duration_minutes',
        'base_price',
        'popularity_score',
        'view_count',
        'is_trending',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_trending' => 'boolean',
        'average_duration_minutes' => 'integer',
        'base_price' => 'decimal:2',
        'popularity_score' => 'integer',
        'view_count' => 'integer',
        'category_id' => 'integer',
    ];

    /**
     * Get the category that the service belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the service requests for the service.
     */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /**
     * Scope a query to only include active services.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include trending services.
     */
    public function scopeTrending($query)
    {
        return $query->where('is_trending', true)
            ->orderBy('popularity_score', 'desc');
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Get the average rating for this service.
     * Returns null until reviews system is implemented.
     *
     * @return float|null
     */
    public function getAverageRatingAttribute(): ?float
    {
        // TODO: Calculate from reviews table when implemented
        // For now, return null to indicate no reviews yet
        return null;
    }

    /**
     * Get the count of reviews for this service.
     * Returns 0 until reviews system is implemented.
     *
     * @return int
     */
    public function getReviewsCountAttribute(): int
    {
        // TODO: Count from reviews table when implemented
        // For now, return 0 to indicate no reviews yet
        return 0;
    }
}
