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
        // Ratings table
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer who rated
            $table->foreignId('engineer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');

            // Overall rating
            $table->tinyInteger('rating')->unsigned(); // 1-5

            // Breakdown ratings
            $table->tinyInteger('professionalism_rating')->unsigned()->nullable();
            $table->tinyInteger('timeliness_rating')->unsigned()->nullable();
            $table->tinyInteger('quality_rating')->unsigned()->nullable();

            // Review
            $table->text('review')->nullable();
            $table->boolean('is_anonymous')->default(false);

            $table->timestamps();

            // Unique constraint: one rating per service request
            $table->unique('service_request_id');

            // Indexes
            $table->index('engineer_id');
            $table->index('rating');
            $table->index('created_at');
        });

        // Engineer ratings aggregate table
        Schema::create('engineer_ratings_aggregate', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engineer_id')->unique()->constrained('users')->onDelete('cascade');

            $table->decimal('average_rating', 3, 2)->default(0); // 0.00 to 5.00
            $table->integer('total_ratings')->default(0);

            // Rating distribution
            $table->json('rating_distribution')->nullable(); // { "5": 10, "4": 5, "3": 2, "2": 1, "1": 0 }

            // Breakdown averages
            $table->decimal('average_professionalism', 3, 2)->nullable();
            $table->decimal('average_timeliness', 3, 2)->nullable();
            $table->decimal('average_quality', 3, 2)->nullable();

            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('engineer_ratings_aggregate');
        Schema::dropIfExists('ratings');
    }
};
