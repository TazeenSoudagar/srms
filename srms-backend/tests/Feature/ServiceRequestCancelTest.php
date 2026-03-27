<?php

declare(strict_types=1);

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
    $this->clientRole = Role::where('name', 'Client')->first();
    $this->engineerRole = Role::where('name', 'Support Engineer')->first();

    // Create users
    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->client = User::factory()->create(['role_id' => $this->clientRole->id]);
    $this->engineer = User::factory()->create(['role_id' => $this->engineerRole->id]);

    // Create service
    $this->service = Service::factory()->create();
});

test('client can cancel their own open service request', function () {
    // Create an open service request
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'open',
    ]);

    // Act as client and cancel the request
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response
    $response->assertStatus(200)
        ->assertJsonFragment([
            'message' => 'Service request cancelled successfully',
        ]);

    // Assert database
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'cancelled',
    ]);

    // Verify closed_at is set
    $serviceRequest->refresh();
    expect($serviceRequest->status->value)->toBe('cancelled')
        ->and($serviceRequest->closed_at)->not->toBeNull();
});

test('client cannot cancel service request that is in progress', function () {
    // Create an in-progress service request
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'in_progress',
        'assigned_to' => $this->engineer->id,
    ]);

    // Act as client and try to cancel the request
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response - 403 Forbidden
    $response->assertStatus(403);

    // Assert database - status should remain in_progress
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'in_progress',
    ]);
});

test('client cannot cancel service request that is already closed', function () {
    // Create a closed service request
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'closed',
        'closed_at' => now(),
    ]);

    // Act as client and try to cancel the request
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response - 403 Forbidden
    $response->assertStatus(403);

    // Assert database - status should remain closed
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'closed',
    ]);
});

test('client cannot cancel another clients service request', function () {
    $anotherClient = User::factory()->create(['role_id' => $this->clientRole->id]);

    // Create a service request by another client
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $anotherClient->id,
        'service_id' => $this->service->id,
        'status' => 'open',
    ]);

    // Act as current client and try to cancel the other client's request
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response - 403 Forbidden
    $response->assertStatus(403);

    // Assert database - status should remain open
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'open',
    ]);
});

test('admin can cancel any service request', function () {
    // Create a service request by client
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'open',
    ]);

    // Act as admin and cancel the request
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response
    $response->assertStatus(200)
        ->assertJsonFragment([
            'message' => 'Service request cancelled successfully',
        ]);

    // Assert database
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'cancelled',
    ]);
});

test('support engineer cannot cancel service requests', function () {
    // Create a service request assigned to engineer
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'open',
        'assigned_to' => $this->engineer->id,
    ]);

    // Act as engineer and try to cancel the request
    $response = $this->actingAs($this->engineer, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response - 403 Forbidden
    $response->assertStatus(403);

    // Assert database - status should remain open
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'open',
    ]);
});

test('unauthenticated user cannot cancel service request', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'open',
    ]);

    // Try to cancel without authentication
    $response = $this->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    // Assert response
    $response->assertStatus(401);

    // Assert database - status should remain open
    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'status' => 'open',
    ]);
});

test('cancel endpoint logs activity', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'created_by' => $this->client->id,
        'service_id' => $this->service->id,
        'status' => 'open',
    ]);

    // Act as client and cancel the request
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$serviceRequest->hashed_id}/cancel");

    $response->assertStatus(200);

    // Assert activity log was created
    $this->assertDatabaseHas('activity_logs', [
        'loggable_type' => ServiceRequest::class,
        'loggable_id' => $serviceRequest->id,
        'user_id' => $this->client->id,
        'action' => 'status_changed',
    ]);
});
