<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Concerns\HasHashidsRouteBinding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasHashidsRouteBinding, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'role_id',
        'email',
        'is_active',
        'latitude',
        'longitude',
        'address',
        'city',
        'state',
        'country',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function engineerProfile(): HasOne
    {
        return $this->hasOne(EngineerProfile::class);
    }

    /**
     * Get the user's profile picture (avatar).
     */
    public function avatar(): MorphOne
    {
        return $this->morphOne(Media::class, 'mediaable')->where('collection', 'avatar');
    }

    /**
     * Get the engineer's uploaded documents (e.g., ID proof, certificates).
     */
    public function documents(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Media::class, 'mediaable')->where('collection', 'documents');
    }

    /**
     * Get the user's full name.
     * This is used by Filament and other parts of the application.
     */
    public function getNameAttribute(): string
    {
        $parts = array_filter([$this->first_name, $this->last_name]);

        return implode(' ', $parts) ?: $this->email;
    }

    /**
     * Get the user's hashid.
     */
    public function getHashidAttribute(): string
    {
        return app(\App\Services\HashidsService::class)->encode($this->id);
    }

    /**
     * Get ratings submitted by this user (as a customer).
     */
    public function ratingsGiven(): HasMany
    {
        return $this->hasMany(Rating::class, 'user_id');
    }

    /**
     * Get ratings received by this user (as an engineer).
     */
    public function ratingsReceived(): HasMany
    {
        return $this->hasMany(Rating::class, 'engineer_id');
    }

    /**
     * Get the engineer's rating aggregate.
     */
    public function ratingAggregate(): HasOne
    {
        return $this->hasOne(EngineerRatingAggregate::class, 'engineer_id');
    }

    /**
     * Get service requests assigned to this user (as engineer).
     */
    public function assignedServiceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'assigned_to');
    }

    /**
     * Get service requests created by this user (as customer).
     */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'created_by');
    }
}
