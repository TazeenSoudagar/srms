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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // e.g., 'created', 'updated', 'assigned', 'status_changed', 'closed', 'deleted'
            $table->unsignedBigInteger('loggable_id'); // ID of the related model
            $table->string('loggable_type'); // Class name of the related model
            $table->json('details')->nullable(); // Additional context data
            $table->timestamps();

            // Indexes for performance
            $table->index('user_id');
            $table->index(['loggable_id', 'loggable_type']); // Composite index for polymorphic relationship
            $table->index('action');
            $table->index('created_at'); // For date-based queries and pruning
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
