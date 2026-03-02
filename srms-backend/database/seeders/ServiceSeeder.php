<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get category IDs
        $homeCleaning = Category::where('slug', 'home-cleaning')->first()->id;
        $plumbing = Category::where('slug', 'plumbing')->first()->id;
        $electrical = Category::where('slug', 'electrical')->first()->id;
        $painting = Category::where('slug', 'painting')->first()->id;
        $acRepair = Category::where('slug', 'ac-appliance-repair')->first()->id;
        $carpentry = Category::where('slug', 'carpentry')->first()->id;
        $pestControl = Category::where('slug', 'pest-control')->first()->id;
        $homeRepair = Category::where('slug', 'home-repair')->first()->id;

        // Create home services
        $services = [
            // Home Cleaning Services
            [
                'name' => 'Deep Home Cleaning',
                'description' => 'Comprehensive deep cleaning service for your entire home including kitchen, bathrooms, and all rooms',
                'category_id' => $homeCleaning,
                'icon' => 'deep-cleaning',
                'average_duration_minutes' => 180,
                'base_price' => 1999.00,
                'is_active' => true,
                'popularity_score' => 150,
                'view_count' => 523,
                'is_trending' => true,
            ],
            [
                'name' => 'Regular Home Cleaning',
                'description' => 'Regular cleaning service for maintaining a clean and tidy home',
                'category_id' => $homeCleaning,
                'icon' => 'regular-cleaning',
                'average_duration_minutes' => 120,
                'base_price' => 999.00,
                'is_active' => true,
                'popularity_score' => 200,
                'view_count' => 845,
                'is_trending' => true,
            ],

            // Plumbing Services
            [
                'name' => 'Plumbing Repair',
                'description' => 'Expert plumbing repairs for leaks, clogs, and pipe issues',
                'category_id' => $plumbing,
                'icon' => 'plumbing-repair',
                'average_duration_minutes' => 90,
                'base_price' => 599.00,
                'is_active' => true,
                'popularity_score' => 180,
                'view_count' => 634,
                'is_trending' => true,
            ],
            [
                'name' => 'Bathroom Fitting',
                'description' => 'Complete bathroom fitting and installation services',
                'category_id' => $plumbing,
                'icon' => 'bathroom-fitting',
                'average_duration_minutes' => 240,
                'base_price' => 2999.00,
                'is_active' => true,
                'popularity_score' => 90,
                'view_count' => 312,
            ],

            // Electrical Services
            [
                'name' => 'Electrical Services',
                'description' => 'Professional electrical wiring, repairs, and installations',
                'category_id' => $electrical,
                'icon' => 'electrical',
                'average_duration_minutes' => 120,
                'base_price' => 799.00,
                'is_active' => true,
                'popularity_score' => 140,
                'view_count' => 456,
                'is_trending' => true,
            ],
            [
                'name' => 'Switch & Socket Installation',
                'description' => 'Installation and repair of electrical switches and sockets',
                'category_id' => $electrical,
                'icon' => 'switch-socket',
                'average_duration_minutes' => 60,
                'base_price' => 299.00,
                'is_active' => true,
                'popularity_score' => 110,
                'view_count' => 389,
            ],

            // Painting Services
            [
                'name' => 'Painting Services',
                'description' => 'Professional interior and exterior painting services',
                'category_id' => $painting,
                'icon' => 'painting',
                'average_duration_minutes' => 480,
                'base_price' => 3999.00,
                'is_active' => true,
                'popularity_score' => 160,
                'view_count' => 567,
                'is_trending' => true,
            ],

            // AC & Appliance Repair
            [
                'name' => 'AC Repair & Service',
                'description' => 'AC servicing, gas refilling, and repair services',
                'category_id' => $acRepair,
                'icon' => 'ac-repair',
                'average_duration_minutes' => 90,
                'base_price' => 699.00,
                'is_active' => true,
                'popularity_score' => 220,
                'view_count' => 892,
                'is_trending' => true,
            ],
            [
                'name' => 'Refrigerator Repair',
                'description' => 'Expert refrigerator and freezer repair services',
                'category_id' => $acRepair,
                'icon' => 'fridge-repair',
                'average_duration_minutes' => 120,
                'base_price' => 799.00,
                'is_active' => true,
                'popularity_score' => 95,
                'view_count' => 278,
            ],

            // Carpentry
            [
                'name' => 'Furniture Assembly',
                'description' => 'Professional furniture assembly and installation',
                'category_id' => $carpentry,
                'icon' => 'furniture-assembly',
                'average_duration_minutes' => 90,
                'base_price' => 499.00,
                'is_active' => true,
                'popularity_score' => 125,
                'view_count' => 412,
                'is_trending' => true,
            ],
            [
                'name' => 'Custom Carpentry',
                'description' => 'Custom woodwork and carpentry services',
                'category_id' => $carpentry,
                'icon' => 'custom-carpentry',
                'average_duration_minutes' => 240,
                'base_price' => 1999.00,
                'is_active' => true,
                'popularity_score' => 80,
                'view_count' => 234,
            ],

            // Pest Control
            [
                'name' => 'General Pest Control',
                'description' => 'Comprehensive pest control treatment for all types of pests',
                'category_id' => $pestControl,
                'icon' => 'pest-control',
                'average_duration_minutes' => 120,
                'base_price' => 899.00,
                'is_active' => true,
                'popularity_score' => 170,
                'view_count' => 589,
                'is_trending' => true,
            ],
            [
                'name' => 'Termite Treatment',
                'description' => 'Professional termite inspection and treatment',
                'category_id' => $pestControl,
                'icon' => 'termite',
                'average_duration_minutes' => 180,
                'base_price' => 1499.00,
                'is_active' => true,
                'popularity_score' => 105,
                'view_count' => 345,
            ],

            // Home Repair
            [
                'name' => 'General Home Repair',
                'description' => 'Handyman services for general home repairs and maintenance',
                'category_id' => $homeRepair,
                'icon' => 'home-repair',
                'average_duration_minutes' => 120,
                'base_price' => 699.00,
                'is_active' => true,
                'popularity_score' => 145,
                'view_count' => 478,
                'is_trending' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
