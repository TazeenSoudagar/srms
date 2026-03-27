<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'first_name' => 'SRMS',
            'last_name' => 'Admin',
            'phone' => '9999999999',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('test1234'),
            'is_active' => true,
            'role_id' => Role::where('name', 'Admin')->first()->id,
        ]);
        User::factory()->count(10)->create([
            'role_id' => Role::where('name', 'Support Engineer')->first()->id,
        ]);
        User::factory()->count(10)->create([
            'role_id' => Role::where('name', 'Client')->first()->id,
        ]);
    }
}
