<?php

declare(strict_types=1);

use App\Models\ActivityLog;
use App\Models\ServiceRequest;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
});

test('activity log model exists and has correct casts', function () {
    $activityLog = new ActivityLog;

    expect($activityLog)->toBeInstanceOf(ActivityLog::class);
    expect($activityLog->getCasts())->toHaveKey('details');
});

test('activity log maintains polymorphic relationship', function () {
    $user = User::factory()->create();
    $serviceRequest = ServiceRequest::factory()->create();

    $activityLog = ActivityLog::create([
        'user_id' => $user->id,
        'action' => 'test_action',
        'loggable_id' => $serviceRequest->id,
        'loggable_type' => ServiceRequest::class,
        'details' => ['test' => 'data'],
    ]);

    expect($activityLog->loggable)->not->toBeNull();
    expect($activityLog->loggable)->toBeInstanceOf(ServiceRequest::class);
});

test('service request has activity logs relationship', function () {
    $serviceRequest = ServiceRequest::factory()->create();

    $relation = $serviceRequest->activityLogs();
    expect($relation)->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\MorphMany::class);
});
