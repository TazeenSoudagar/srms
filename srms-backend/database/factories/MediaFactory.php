<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ServiceRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word().'.'.fake()->fileExtension(),
            'url' => '/storage/'.fake()->filePath(),
            'mediaable_id' => ServiceRequest::factory(),
            'mediaable_type' => ServiceRequest::class,
        ];
    }
}
