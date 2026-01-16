<?php

namespace Database\Factories;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceRequest>
 */
class ServiceRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_number' => ServiceRequest::generateRequestNumber(),
            'service_id' => Service::factory(),
            'created_by' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => RequestStatus::Open,
            'priority' => RequestPriority::Low,
            // assigned_to, closed_at, updated_by are nullable - don't include in factory
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'is_active' => true,
        ];
    }
}
