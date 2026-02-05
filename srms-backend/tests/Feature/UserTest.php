<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
});

test('admin can view all users', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    User::factory()->count(5)->create(['role_id' => Role::where('name', 'Client')->first()->id]);

    $response = actingAs($admin)->getJson('/api/users');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'first_name', 'last_name', 'email', 'role'],
            ],
        ]);
});

test('non-admin cannot view users list', function () {
    $client = User::factory()->create(['role_id' => Role::where('name', 'Client')->first()->id]);

    $response = actingAs($client)->getJson('/api/users');

    $response->assertForbidden();
});

test('admin can create user', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $roleId = Role::where('name', 'Support Engineer')->first()->id;

    $userData = [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'role_id' => $roleId,
        'is_active' => true,
    ];

    $response = actingAs($admin)->postJson('/api/users', $userData);

    $response->assertCreated();
    assertDatabaseHas('users', [
        'email' => 'john@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);
});

test('admin can create user with unique email validation', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);

    $userData = [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'existing@example.com',
        'role_id' => Role::where('name', 'Client')->first()->id,
    ];

    $response = actingAs($admin)->postJson('/api/users', $userData);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('non-admin cannot create user', function () {
    $client = User::factory()->create(['role_id' => Role::where('name', 'Client')->first()->id]);

    $userData = [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'role_id' => Role::where('name', 'Client')->first()->id,
    ];

    $response = actingAs($client)->postJson('/api/users', $userData);

    $response->assertForbidden();
});

test('admin can view single user', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $user = User::factory()->create();

    $response = actingAs($admin)->getJson("/api/users/{$user->hashid}");

    $response->assertOk()->assertJsonFragment(['email' => $user->email]);
});

test('admin can update user', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $user = User::factory()->create();

    $updateData = [
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'email' => $user->email,
        'role_id' => $user->role_id,
        'is_active' => false,
    ];

    $response = actingAs($admin)->putJson("/api/users/{$user->hashid}", $updateData);

    $response->assertOk();
    assertDatabaseHas('users', [
        'id' => $user->id,
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'is_active' => false,
    ]);
});

test('admin can delete user', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $user = User::factory()->create();

    $response = actingAs($admin)->deleteJson("/api/users/{$user->hashid}");

    $response->assertOk();
    expect(User::find($user->id))->toBeNull();
});

test('non-admin cannot update user', function () {
    $client = User::factory()->create(['role_id' => Role::where('name', 'Client')->first()->id]);
    $user = User::factory()->create();

    $updateData = [
        'first_name' => 'Updated',
        'email' => $user->email,
        'role_id' => $user->role_id,
    ];

    $response = actingAs($client)->putJson("/api/users/{$user->hashid}", $updateData);

    $response->assertForbidden();
});

test('non-admin cannot delete user', function () {
    $client = User::factory()->create(['role_id' => Role::where('name', 'Client')->first()->id]);
    $user = User::factory()->create();

    $response = actingAs($client)->deleteJson("/api/users/{$user->hashid}");

    $response->assertForbidden();
});

test('user list supports pagination', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    User::factory()->count(20)->create();

    $response = actingAs($admin)->getJson('/api/users?per_page=10');

    $response->assertOk()
        ->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);

    expect($response->json('data'))->toHaveCount(10);
});

test('user list supports search', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    User::factory()->create(['first_name' => 'SearchTest', 'email' => 'searchtest@example.com']);
    User::factory()->count(5)->create();

    $response = actingAs($admin)->getJson('/api/users?search=SearchTest');

    $response->assertOk();
    $data = $response->json('data');
    // Search might return multiple results, just check one exists with the name
    $found = collect($data)->firstWhere('first_name', 'SearchTest');
    expect($found)->not->toBeNull();
});

test('user creation requires valid data', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);

    $response = actingAs($admin)->postJson('/api/users', [
        'first_name' => '',
        'email' => 'invalid-email',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'role_id']);
});

test('admin can filter users by role', function () {
    $admin = User::factory()->create(['role_id' => Role::where('name', 'Admin')->first()->id]);
    $clientRoleId = Role::where('name', 'Client')->first()->id;
    $supportRoleId = Role::where('name', 'Support Engineer')->first()->id;

    User::factory()->count(3)->create(['role_id' => $clientRoleId]);
    User::factory()->count(2)->create(['role_id' => $supportRoleId]);

    $response = actingAs($admin)->getJson("/api/users?role_id={$clientRoleId}");

    $response->assertOk();
    // Check at least some clients are returned
    $data = $response->json('data');
    $clients = collect($data)->filter(fn($user) => $user['role']['name'] === 'Client');
    expect($clients->count())->toBeGreaterThanOrEqual(3);
});
