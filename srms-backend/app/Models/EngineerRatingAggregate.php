<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EngineerRatingAggregate extends Model
{
    use HasFactory;

    protected $fillable = [
        'engineer_id',
        'average_rating',
        'total_ratings',
        'rating_distribution',
        'average_professionalism',
        'average_timeliness',
        'average_quality',
        'last_calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'average_rating' => 'decimal:2',
            'total_ratings' => 'integer',
            'rating_distribution' => 'array',
            'average_professionalism' => 'decimal:2',
            'average_timeliness' => 'decimal:2',
            'average_quality' => 'decimal:2',
            'last_calculated_at' => 'datetime',
        ];
    }

    /**
     * Get the engineer this aggregate belongs to.
     */
    public function engineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'engineer_id');
    }
}
