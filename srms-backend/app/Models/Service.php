<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory, HasHashidsRouteBinding;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'category',
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
    ];

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class);
    }
}
