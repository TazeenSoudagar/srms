<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('engineer_profiles');

        Schema::create('engineer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->integer('years_of_experience')->nullable();
            $table->json('specializations')->nullable();
            $table->enum('availability_status', ['available', 'busy', 'offline'])->default('available');
            $table->timestamps();
        });

        // Migrate existing data from users table
        DB::statement('
            INSERT INTO engineer_profiles (user_id, bio, hourly_rate, years_of_experience, specializations, availability_status, created_at, updated_at)
            SELECT u.id, u.bio, u.hourly_rate, u.years_of_experience, u.specializations, u.availability_status, NOW(), NOW()
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = \'Support Engineer\'
              AND (u.bio IS NOT NULL OR u.hourly_rate IS NOT NULL OR u.years_of_experience IS NOT NULL OR u.specializations IS NOT NULL)
        ');

        // Drop index if it exists (IF EXISTS not supported in older MySQL versions)
        $indexExists = collect(DB::select("SHOW INDEX FROM users WHERE Key_name = 'availability_status'"))
            ->isNotEmpty();
        if ($indexExists) {
            DB::statement('ALTER TABLE users DROP INDEX availability_status');
        }
        DB::statement(
            "ALTER TABLE users MODIFY availability_status ENUM('available','busy','offline') NULL DEFAULT NULL"
        );

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'hourly_rate',
                'years_of_experience',
                'specializations',
                'availability_status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('country');
            $table->decimal('hourly_rate', 8, 2)->nullable()->after('bio');
            $table->integer('years_of_experience')->nullable()->after('hourly_rate');
            $table->json('specializations')->nullable()->after('years_of_experience');
            $table->enum('availability_status', ['available', 'busy', 'offline'])
                ->default('available')
                ->after('specializations');
            $table->index('availability_status');
        });

        // Restore data from engineer_profiles back to users
        DB::statement('
            UPDATE users u
            INNER JOIN engineer_profiles ep ON ep.user_id = u.id
            SET u.bio = ep.bio,
                u.hourly_rate = ep.hourly_rate,
                u.years_of_experience = ep.years_of_experience,
                u.specializations = ep.specializations,
                u.availability_status = ep.availability_status
        ');

        Schema::dropIfExists('engineer_profiles');
    }
};
