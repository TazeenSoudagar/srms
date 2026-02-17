<?php

namespace Database\Factories;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceSchedule>
 */
class ServiceScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_request_id' => ServiceRequest::factory(),
            'customer_id' => User::factory(),
            'engineer_id' => null,
            'scheduled_at' => $this->faker->dateTimeBetween('+1 day', '+30 days'),
            'completed_at' => null,
            'status' => $this->faker->randomElement(['pending', 'confirmed']),
            'notes' => $this->faker->optional()->sentence(),
            'location' => $this->faker->optional()->address(),
            'estimated_duration_minutes' => $this->faker->randomElement([30, 60, 90, 120]),
            'reminder_sent_at' => null,
        ];
    }

    /**
     * Indicate that the schedule is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    /**
     * Indicate that the schedule is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    /**
     * Indicate that the schedule is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => now(),
            'scheduled_at' => $this->faker->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    /**
     * Indicate that the schedule is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Indicate that the schedule has an assigned engineer.
     */
    public function withEngineer(): static
    {
        return $this->state(fn (array $attributes) => [
            'engineer_id' => User::factory(),
        ]);
    }
}
