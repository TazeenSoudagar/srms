<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            'name' => 'Admin',
            'is_active' => true,
        ]);
        Role::create([
            'name' => 'Support Engineer',
            'is_active' => true,
        ]);
        Role::create([
            'name' => 'Client',
            'is_active' => true,
        ]);
    }
}
