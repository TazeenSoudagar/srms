<?php

declare(strict_types=1);

use App\Models\OtpVerification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\postJson;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
    Queue::fake();
});

test('otp send requires valid email format', function () {
    $response = postJson('/api/auth/send-otp', [
        'email' => 'invalid-email',
        'type' => 'email',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('otp send requires type field', function () {
    $response = postJson('/api/auth/send-otp', [
        'email' => 'test@example.com',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

test('otp verification requires valid data', function () {
    $response = postJson('/api/auth/verify-otp', [
        'email' => 'test@example.com',
        'otp' => '123456',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});
