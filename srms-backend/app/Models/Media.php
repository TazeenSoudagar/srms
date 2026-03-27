<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasHashidsRouteBinding;

    protected $fillable = [
        'name',
        'url',
        'path',
        'mediaable_id',
        'mediaable_type',
    ];

    public function mediaable()
    {
        return $this->morphTo();
    }
}
