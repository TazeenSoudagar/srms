<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Home Cleaning',
                'slug' => 'home-cleaning',
                'description' => 'Professional home cleaning services including deep cleaning, regular cleaning, and move-in/out cleaning',
                'icon' => 'cleaning',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Plumbing',
                'slug' => 'plumbing',
                'description' => 'Expert plumbing services for repairs, installations, and maintenance',
                'icon' => 'plumbing',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Electrical',
                'slug' => 'electrical',
                'description' => 'Licensed electricians for wiring, repairs, and electrical installations',
                'icon' => 'electrical',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Painting',
                'slug' => 'painting',
                'description' => 'Professional painting services for interior and exterior walls',
                'icon' => 'painting',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'AC & Appliance Repair',
                'slug' => 'ac-appliance-repair',
                'description' => 'AC servicing, repairs, and appliance maintenance',
                'icon' => 'ac-repair',
                'display_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Carpentry',
                'slug' => 'carpentry',
                'description' => 'Custom carpentry work, furniture repair, and woodwork services',
                'icon' => 'carpentry',
                'display_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Pest Control',
                'slug' => 'pest-control',
                'description' => 'Professional pest control and termite treatment services',
                'icon' => 'pest-control',
                'display_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Home Repair',
                'slug' => 'home-repair',
                'description' => 'General home repairs and handyman services',
                'icon' => 'home-repair',
                'display_order' => 8,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
