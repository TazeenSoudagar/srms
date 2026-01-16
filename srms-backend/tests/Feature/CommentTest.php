<?php

declare(strict_types=1);

use App\Models\Comment;
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
    ]);
});

test('user can create comment on accessible service request', function () {
    $response = $this->actingAs($this->client, 'sanctum')
        ->postJson("/api/service-requests/{$this->serviceRequest->id}/comments", [
            'body' => 'This is a test comment',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'body',
                'user',
                'created_at',
            ],
        ]);

    $this->assertDatabaseHas('comments', [
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $this->client->id,
        'body' => 'This is a test comment',
    ]);
});

test('user can view comments on service request', function () {
    // Create comments
    Comment::factory()->count(3)->create([
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $this->client->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->getJson("/api/service-requests/{$this->serviceRequest->id}/comments");

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(3);
});

test('user can update their own comment', function () {
    $comment = Comment::factory()->create([
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $this->client->id,
        'body' => 'Original comment',
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->putJson("/api/service-requests/{$this->serviceRequest->id}/comments/{$comment->id}", [
            'body' => 'Updated comment',
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('comments', [
        'id' => $comment->id,
        'body' => 'Updated comment',
    ]);
});

test('user cannot update another users comment', function () {
    $otherUser = User::factory()->create(['role_id' => $this->clientRole->id]);
    $comment = Comment::factory()->create([
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $otherUser->id,
        'body' => 'Original comment',
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->putJson("/api/service-requests/{$this->serviceRequest->id}/comments/{$comment->id}", [
            'body' => 'Updated comment',
        ]);

    $response->assertStatus(403);
});

test('user can delete their own comment', function () {
    $comment = Comment::factory()->create([
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $this->client->id,
    ]);

    $response = $this->actingAs($this->client, 'sanctum')
        ->deleteJson("/api/service-requests/{$this->serviceRequest->id}/comments/{$comment->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('comments', [
        'id' => $comment->id,
    ]);
});

test('admin can delete any comment', function () {
    $comment = Comment::factory()->create([
        'commentable_id' => $this->serviceRequest->id,
        'commentable_type' => ServiceRequest::class,
        'user_id' => $this->client->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/service-requests/{$this->serviceRequest->id}/comments/{$comment->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('comments', [
        'id' => $comment->id,
    ]);
});
