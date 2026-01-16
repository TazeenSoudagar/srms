<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create predefined common services
        $services = [
            [
                'name' => 'IT Support',
                'description' => 'Technical support for hardware, software, and network issues',
                'is_active' => true,
            ],
            [
                'name' => 'Account Management',
                'description' => 'Assistance with account setup, modifications, and access management',
                'is_active' => true,
            ],
            [
                'name' => 'Billing & Payments',
                'description' => 'Help with billing inquiries, payment processing, and invoice issues',
                'is_active' => true,
            ],
            [
                'name' => 'Product Information',
                'description' => 'Information about products, features, and specifications',
                'is_active' => true,
            ],
            [
                'name' => 'Technical Troubleshooting',
                'description' => 'Diagnosis and resolution of technical problems and errors',
                'is_active' => true,
            ],
            [
                'name' => 'Feature Request',
                'description' => 'Submit and track requests for new features or enhancements',
                'is_active' => true,
            ],
            [
                'name' => 'Bug Report',
                'description' => 'Report software bugs, glitches, and unexpected behavior',
                'is_active' => true,
            ],
            [
                'name' => 'Data Recovery',
                'description' => 'Assistance with data backup, recovery, and restoration services',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        // Create additional random services using factory
        Service::factory()->count(5)->create();
    }
}
