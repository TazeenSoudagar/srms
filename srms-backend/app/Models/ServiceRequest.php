<?php

namespace App\Models;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
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

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
