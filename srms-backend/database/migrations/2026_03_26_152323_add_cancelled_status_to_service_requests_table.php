<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add a comment to document that 'cancelled' is now a valid status
        // The status column is already a string, so no schema change is needed
        // This migration serves as documentation that 'cancelled' is a valid status value
        // Valid status values: 'open', 'in_progress', 'closed', 'cancelled'

        // Optionally, you can add a check constraint if your database supports it
        // For MySQL 8.0.16+:
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE service_requests ADD CONSTRAINT chk_status CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the check constraint if it was added
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS chk_status");
        }
    }
};
