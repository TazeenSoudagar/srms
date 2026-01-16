<?php

declare(strict_types=1);

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles
    $this->seed(\Database\Seeders\RoleSeeder::class);

    // Create roles
    $this->adminRole = Role::where('name', 'Admin')->first();
    $this->supportRole = Role::where('name', 'Support Engineer')->first();
    $this->clientRole = Role::where('name', 'Client')->first();

    // Create users
    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->supportEngineer = User::factory()->create(['role_id' => $this->supportRole->id]);
    $this->client = User::factory()->create(['role_id' => $this->clientRole->id]);

    // Create service
    $this->service = Service::factory()->create();

    // Create service request
    $this->serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
        'priority' => RequestPriority::Low,
    ]);
});

test('client can create a service request', function () {
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson('/api/service-requests', [
            'service_id' => $this->service->id,
            'title' => 'Test Request',
            'description' => 'Test Description',
            'priority' => 'low',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'request_number',
                'title',
                'status',
                'priority',
            ],
        ]);

    $this->assertDatabaseHas('service_requests', [
        'title' => 'Test Request',
        'created_by' => $this->client->id,
    ]);
});

test('admin can view all service requests', function () {
    // Create another request by different client
    $otherClient = User::factory()->create(['role_id' => $this->clientRole->id]);
    ServiceRequest::factory()->create([
        'created_by' => $otherClient->id,
        'service_id' => $this->service->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/service-requests');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(2); // Both requests visible
});

test('client can only view their own service requests', function () {
    // Create request by another client
    $otherClient = User::factory()->create(['role_id' => $this->clientRole->id]);
    ServiceRequest::factory()->create([
        'created_by' => $otherClient->id,
        'service_id' => $this->service->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson('/api/service-requests');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1); // Only own request
    expect($response->json('data.0.id'))->toBe(
        app(\App\Services\HashidsService::class)->encode($this->serviceRequest->id)
    );
});

test('support engineer can only view assigned requests', function () {
    // Assign request to support engineer
    $this->serviceRequest->update(['assigned_to' => $this->supportEngineer->id]);

    // Create unassigned request
    ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'assigned_to' => null,
    ]);

    $response = $this->actingAs($this->supportEngineer, 'sanctum')
        ->getJson('/api/service-requests');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1); // Only assigned request
});

test('admin can assign request to support engineer', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/service-requests/{$this->serviceRequest->id}/assign", [
            'assigned_to' => $this->supportEngineer->id,
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('service_requests', [
        'id' => $this->serviceRequest->id,
        'assigned_to' => $this->supportEngineer->id,
    ]);
});

test('client cannot assign request', function () {
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$this->serviceRequest->id}/assign", [
            'assigned_to' => $this->supportEngineer->id,
        ]);

    $response->assertStatus(403);
});

test('support engineer can update assigned request status', function () {
    $this->serviceRequest->update(['assigned_to' => $this->supportEngineer->id]);

    $response = $this->actingAs($this->supportEngineer, 'sanctum')
        ->patchJson("/api/service-requests/{$this->serviceRequest->id}/status", [
            'status' => 'in_progress',
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('service_requests', [
        'id' => $this->serviceRequest->id,
        'status' => 'in_progress',
    ]);
});

test('client cannot close request', function () {
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$this->serviceRequest->id}/close");

    $response->assertStatus(403);
});

test('support engineer can close assigned request', function () {
    $this->serviceRequest->update(['assigned_to' => $this->supportEngineer->id]);

    $response = $this->actingAs($this->supportEngineer, 'sanctum')
        ->postJson("/api/service-requests/{$this->serviceRequest->id}/close");

    $response->assertStatus(200);
    $this->assertDatabaseHas('service_requests', [
        'id' => $this->serviceRequest->id,
        'status' => 'closed',
    ]);
    expect($this->serviceRequest->fresh()->closed_at)->not->toBeNull();
});

test('service request filtering works', function () {
    // Create requests with different statuses
    ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => RequestStatus::Closed,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/service-requests?status=closed');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.status'))->toBe('closed');
});

test('service request search works', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/service-requests?search='.$this->serviceRequest->title);

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
});
