<?php

use App\Models\ServiceSchedule;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Role;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);

    // Create roles
    $this->adminRole = Role::where('name', 'Admin')->first();
    $this->clientRole = Role::where('name', 'Client')->first();
    $this->engineerRole = Role::where('name', 'Support Engineer')->first();

    // Create users
    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->client = User::factory()->create(['role_id' => $this->clientRole->id]);
    $this->engineer = User::factory()->create(['role_id' => $this->engineerRole->id]);
    $this->anotherClient = User::factory()->create(['role_id' => $this->clientRole->id]);

    // Create service and service request
    $this->service = Service::factory()->create();
    $this->serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
    ]);
});

it('can list schedules for authenticated user', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson('/api/schedules');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'scheduled_at',
                    'status',
                    'customer',
                    'service_request',
                ],
            ],
            'meta',
        ]);
});

it('customer can only see their own schedules', function () {
    $ownSchedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
    ]);

    $otherServiceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->anotherClient->id,
        'service_id' => $this->service->id,
    ]);

    $otherSchedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->anotherClient->id,
        'service_request_id' => $otherServiceRequest->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson('/api/schedules');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['id'])->toBe($ownSchedule->hashed_id);
});

it('engineer can only see their assigned schedules', function () {
    $assignedSchedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'engineer_id' => $this->engineer->id,
    ]);

    $unassignedSchedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->anotherClient->id,
        'service_request_id' => ServiceRequest::factory()->create([
            'created_by' => $this->anotherClient->id,
            'service_id' => $this->service->id,
        ])->id,
    ]);

    $response = $this->actingAs($this->engineer, 'sanctum')
        ->getJson('/api/schedules');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['id'])->toBe($assignedSchedule->hashed_id);
});

it('can create a schedule', function () {
    $scheduledAt = now()->addDays(2)->setTime(10, 0);

    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson('/api/schedules', [
            'service_request_id' => $this->serviceRequest->hashed_id,
            'scheduled_at' => $scheduledAt->toIso8601String(),
            'location' => '123 Main St',
            'notes' => 'Please bring necessary tools',
            'estimated_duration_minutes' => 90,
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'scheduled_at',
                'status',
                'location',
                'notes',
            ],
        ]);

    $this->assertDatabaseHas('service_schedules', [
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'location' => '123 Main St',
        'status' => 'pending',
    ]);
});

it('cannot create schedule with past date', function () {
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson('/api/schedules', [
            'service_request_id' => $this->serviceRequest->hashed_id,
            'scheduled_at' => now()->subDays(1)->toIso8601String(),
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['scheduled_at']);
});

it('can view a specific schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson("/api/schedules/{$schedule->hashed_id}");

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $schedule->hashed_id,
                'status' => $schedule->status,
            ],
        ]);
});

it('cannot view another users schedule', function () {
    $otherServiceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->anotherClient->id,
        'service_id' => $this->service->id,
    ]);

    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->anotherClient->id,
        'service_request_id' => $otherServiceRequest->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson("/api/schedules/{$schedule->hashed_id}");

    $response->assertStatus(403);
});

it('can update own schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'status' => 'pending',
    ]);

    $newTime = now()->addDays(3)->setTime(14, 0);

    $response = $this->actingAs($this->client, 'sanctum')
        ->putJson("/api/schedules/{$schedule->hashed_id}", [
            'scheduled_at' => $newTime->toIso8601String(),
            'notes' => 'Updated notes',
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('service_schedules', [
        'id' => $schedule->id,
        'notes' => 'Updated notes',
    ]);
});

it('engineer can update assigned schedule status', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'engineer_id' => $this->engineer->id,
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->engineer, 'sanctum')
        ->putJson("/api/schedules/{$schedule->hashed_id}", [
            'status' => 'in_progress',
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('service_schedules', [
        'id' => $schedule->id,
        'status' => 'in_progress',
    ]);
});

it('can cancel a schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'status' => 'pending',
        'scheduled_at' => now()->addDays(2),
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/schedules/{$schedule->hashed_id}/cancel");

    $response->assertStatus(200);

    $this->assertDatabaseHas('service_schedules', [
        'id' => $schedule->id,
        'status' => 'cancelled',
    ]);
});

it('cannot cancel completed schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'status' => 'completed',
        'scheduled_at' => now()->subDays(1),
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/schedules/{$schedule->hashed_id}/cancel");

    // 403 because the policy denies canceling completed schedules
    $response->assertStatus(403);
});

it('engineer can complete schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'engineer_id' => $this->engineer->id,
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($this->engineer, 'sanctum')
        ->postJson("/api/schedules/{$schedule->hashed_id}/complete");

    $response->assertStatus(200);

    $this->assertDatabaseHas('service_schedules', [
        'id' => $schedule->id,
        'status' => 'completed',
    ]);

    $schedule->refresh();
    expect($schedule->completed_at)->not->toBeNull();
});

it('customer cannot complete schedule', function () {
    $schedule = ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'engineer_id' => $this->engineer->id,
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/schedules/{$schedule->hashed_id}/complete");

    $response->assertStatus(403);
});

it('can get available time slots', function () {
    $date = now()->addDays(2)->toDateString();

    // Create an existing schedule
    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'engineer_id' => $this->engineer->id,
        'scheduled_at' => now()->addDays(2)->setTime(10, 0),
        'estimated_duration_minutes' => 60,
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson("/api/schedules/available-slots?date={$date}&engineer_id={$this->engineer->id}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'date',
            'slots' => [
                '*' => [
                    'time',
                    'display',
                    'available',
                ],
            ],
        ]);

    $slots = $response->json('slots');
    expect($slots)->toBeArray();

    // Check that 10 AM slot is not available
    $tenAmSlot = collect($slots)->firstWhere('display', '10:00 AM');
    expect($tenAmSlot['available'])->toBeFalse();
});

it('filters schedules by status', function () {
    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'status' => 'pending',
    ]);

    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson('/api/schedules?status=pending');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['status'])->toBe('pending');
});

it('filters schedules by date range', function () {
    $startDate = now()->addDays(1);
    $endDate = now()->addDays(7);

    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'scheduled_at' => now()->addDays(3),
    ]);

    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
        'scheduled_at' => now()->addDays(10),
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson("/api/schedules?start_date={$startDate->toDateString()}&end_date={$endDate->toDateString()}");

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveCount(1);
});

it('admin can view all schedules', function () {
    ServiceSchedule::factory()->create([
        'customer_id' => $this->client->id,
        'service_request_id' => $this->serviceRequest->id,
    ]);

    $otherServiceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->anotherClient->id,
        'service_id' => $this->service->id,
    ]);

    ServiceSchedule::factory()->create([
        'customer_id' => $this->anotherClient->id,
        'service_request_id' => $otherServiceRequest->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/schedules');

    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveCount(2);
});
