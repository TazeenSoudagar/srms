<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Location fields
            $table->decimal('latitude', 10, 8)->nullable()->after('role_id');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('address')->nullable()->after('longitude');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('country')->nullable()->after('state');

            // Profile fields
            $table->text('bio')->nullable()->after('country');
            $table->decimal('hourly_rate', 8, 2)->nullable()->after('bio');
            $table->integer('years_of_experience')->nullable()->after('hourly_rate');
            $table->json('specializations')->nullable()->after('years_of_experience');

            // Availability
            $table->enum('availability_status', ['available', 'busy', 'offline'])
                ->default('available')
                ->after('specializations');

            // Indexes for performance
            $table->index(['latitude', 'longitude'], 'idx_user_location');
            $table->index('availability_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_user_location');
            $table->dropIndex(['availability_status']);

            $table->dropColumn([
                'latitude',
                'longitude',
                'address',
                'city',
                'state',
                'country',
                'bio',
                'hourly_rate',
                'years_of_experience',
                'specializations',
                'availability_status',
            ]);
        });
    }
};
