<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestSupportEngineerSeeder extends Seeder
{
    /**
     * Seed test data for Support Engineer testing
     */
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('name', 'Admin')->first();
        $supportRole = Role::where('name', 'Support Engineer')->first();
        $clientRole = Role::where('name', 'Client')->first();

        // Create Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@srms.test'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '1234567890',
                'role_id' => $adminRole->id,
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $this->command->info('Admin created: admin@srms.test / password');

        // Create Support Engineer
        $engineer = User::firstOrCreate(
            ['email' => 'engineer@srms.test'],
            [
                'first_name' => 'John',
                'last_name' => 'Engineer',
                'phone' => '9876543210',
                'role_id' => $supportRole->id,
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $this->command->info('Support Engineer created: engineer@srms.test / password123');

        // Create Client
        $client = User::firstOrCreate(
            ['email' => 'client@srms.test'],
            [
                'first_name' => 'Jane',
                'last_name' => 'Client',
                'phone' => '5551234567',
                'role_id' => $clientRole->id,
                'is_active' => true,
            ]
        );
        $this->command->info('Client created: client@srms.test');

        // Create Service
        $service = Service::firstOrCreate(
            ['name' => 'Technical Support'],
            [
                'description' => 'General technical support service',
                'is_active' => true,
            ]
        );

        // Create Service Requests assigned to engineer
        $requests = [
            [
                'title' => 'Critical Bug: Login not working',
                'description' => 'Users cannot log in to the system. This is blocking production.',
                'status' => 'open',
                'priority' => 'high',
                'due_date' => now()->subDays(2), // Overdue
            ],
            [
                'title' => 'Feature Request: Dark Mode',
                'description' => 'Add dark mode to the application for better user experience.',
                'status' => 'in_progress',
                'priority' => 'medium',
                'due_date' => now()->addDays(3), // Due soon
            ],
            [
                'title' => 'Database Performance Optimization',
                'description' => 'Optimize slow queries in the reporting module.',
                'status' => 'open',
                'priority' => 'high',
                'due_date' => now()->addDays(5),
            ],
            [
                'title' => 'Documentation Update',
                'description' => 'Update user documentation for the new features.',
                'status' => 'open',
                'priority' => 'low',
                'due_date' => now()->addDays(10),
            ],
            [
                'title' => 'Email Configuration Fixed',
                'description' => 'Configured email settings for SMTP server.',
                'status' => 'closed',
                'priority' => 'medium',
                'closed_at' => now()->subDays(1),
            ],
        ];

        foreach ($requests as $requestData) {
            ServiceRequest::factory()->create([
                'service_id' => $service->id,
                'created_by' => $client->id,
                'assigned_to' => $engineer->id,
                'title' => $requestData['title'],
                'description' => $requestData['description'],
                'status' => $requestData['status'],
                'priority' => $requestData['priority'],
                'due_date' => $requestData['due_date'] ?? null,
                'closed_at' => $requestData['closed_at'] ?? null,
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Test service requests created (5 requests assigned to Support Engineer)');
        $this->command->info('');
        $this->command->info('=== Testing Credentials ===');
        $this->command->info('Support Engineer: engineer@srms.test / password123');
        $this->command->info('Admin: admin@srms.test / password');
        $this->command->info('Client: client@srms.test (OTP only)');
    }
}
