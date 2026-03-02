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
        Schema::table('services', function (Blueprint $table) {
            // Discovery and categorization fields
            $table->foreignId('category_id')->nullable()->after('description')->constrained('categories')->onDelete('set null');
            $table->string('icon')->nullable()->after('category_id');

            // Pricing and duration
            $table->integer('average_duration_minutes')->nullable()->after('icon');
            $table->decimal('base_price', 8, 2)->nullable()->after('average_duration_minutes');

            // Popularity and trending
            $table->integer('popularity_score')->default(0)->after('base_price');
            $table->integer('view_count')->default(0)->after('popularity_score');
            $table->boolean('is_trending')->default(false)->after('view_count');

            // Indexes for performance
            $table->index('category_id');
            $table->index('is_trending');
            $table->index('popularity_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['is_trending']);
            $table->dropIndex(['popularity_score']);

            $table->dropColumn([
                'category_id',
                'icon',
                'average_duration_minutes',
                'base_price',
                'popularity_score',
                'view_count',
                'is_trending',
            ]);
        });
    }
};
