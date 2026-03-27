<?php

declare(strict_types=1);

use App\Enums\RequestStatus;
use App\Models\Media;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    // Seed roles
    $this->seed(\Database\Seeders\RoleSeeder::class);

    // Get roles
    $this->clientRole = Role::where('name', 'Client')->first();
    $this->supportRole = Role::where('name', 'Support Engineer')->first();
    $this->adminRole = Role::where('name', 'Admin')->first();

    // Create users
    $this->client = User::factory()->create(['role_id' => $this->clientRole->id]);
    $this->otherClient = User::factory()->create(['role_id' => $this->clientRole->id]);
    $this->engineer = User::factory()->create(['role_id' => $this->supportRole->id]);
    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);

    // Create service
    $this->service = Service::factory()->create();
});

test('customer can delete their own attachment when request status is open', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request
    $response = $this->actingAs($this->client)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Attachment deleted successfully',
        ]);

    // Verify media is deleted from database
    expect(Media::find($media->id))->toBeNull();

    // Verify file is deleted from storage
    Storage::disk('public')->assertMissing($path);
});

test('customer cannot delete attachment when request status is in_progress', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::InProgress,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request
    $response = $this->actingAs($this->client)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(403)
        ->assertJson([
            'message' => 'Cannot delete attachments. Request is already in progress or closed.',
        ]);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});

test('customer cannot delete attachment when request status is closed', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Closed,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request
    $response = $this->actingAs($this->client)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(403)
        ->assertJson([
            'message' => 'Cannot delete attachments. Request is already in progress or closed.',
        ]);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});

test('customer cannot delete another customers attachment', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request as different customer
    $response = $this->actingAs($this->otherClient)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(403);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});

test('support engineer cannot delete customer attachment', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'assigned_to' => $this->engineer->id,
        'status' => RequestStatus::Open,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request as support engineer
    $response = $this->actingAs($this->engineer)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(403);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});

test('admin can delete any attachment regardless of status', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::InProgress,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request as admin (should fail due to status check)
    $response = $this->actingAs($this->admin)
        ->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    // Admin is authorized but status check still applies
    $response->assertStatus(403)
        ->assertJson([
            'message' => 'Cannot delete attachments. Request is already in progress or closed.',
        ]);
});

test('returns 404 when media does not belong to service request', function () {
    $serviceRequest1 = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
    ]);

    $serviceRequest2 = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
    ]);

    // Create a media attachment for request 2
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest2->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest2->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId1 = $hashids->encode($serviceRequest1->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Try to delete media using request 1's ID (mismatch)
    $response = $this->actingAs($this->client)
        ->deleteJson("/api/service-requests/{$hashedRequestId1}/media/{$hashedMediaId}");

    $response->assertStatus(404)
        ->assertJson([
            'message' => 'Media not found for this request',
        ]);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});

test('unauthenticated user cannot delete attachment', function () {
    $serviceRequest = ServiceRequest::factory()->create([
        'service_id' => $this->service->id,
        'created_by' => $this->client->id,
        'status' => RequestStatus::Open,
    ]);

    // Create a media attachment
    $file = UploadedFile::fake()->create('document.pdf', 100);
    $fileName = 'test_file_12345.pdf';
    $path = $file->storeAs("service-requests/{$serviceRequest->id}", $fileName, 'public');

    $media = Media::create([
        'name' => 'document.pdf',
        'url' => Storage::url($path),
        'mediaable_id' => $serviceRequest->id,
        'mediaable_type' => ServiceRequest::class,
    ]);

    $hashids = app(\App\Services\HashidsService::class);
    $hashedRequestId = $hashids->encode($serviceRequest->id);
    $hashedMediaId = $hashids->encode($media->id);

    // Make DELETE request without authentication
    $response = $this->deleteJson("/api/service-requests/{$hashedRequestId}/media/{$hashedMediaId}");

    $response->assertStatus(401);

    // Verify media still exists
    expect(Media::find($media->id))->not->toBeNull();
});
