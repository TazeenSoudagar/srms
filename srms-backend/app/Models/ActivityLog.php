<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'action',
        'loggable_id',
        'loggable_type',
        'details',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent loggable model (polymorphic relationship).
     */
    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Create an activity log entry.
     *
     * @param  User  $user  The user performing the action
     * @param  string  $action  The action being performed (e.g., 'created', 'updated')
     * @param  Model  $loggable  The model being acted upon
     * @param  array<string, mixed>  $details  Additional context data
     */
    public static function log(User $user, string $action, Model $loggable, array $details = []): self
    {
        return self::create([
            'user_id' => $user->id,
            'action' => $action,
            'loggable_id' => $loggable->id,
            'loggable_type' => $loggable::class,
            'details' => $details,
        ]);
    }
}
