<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory, HasHashidsRouteBinding;

    protected $fillable = ['name', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class);
    }
}
