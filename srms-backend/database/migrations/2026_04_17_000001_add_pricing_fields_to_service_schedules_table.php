<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_schedules', function (Blueprint $table) {
            $table->decimal('actual_price', 10, 2)->nullable()->after('estimated_duration_minutes');
            $table->decimal('gst_rate', 5, 2)->default(18.00)->after('actual_price');
            $table->decimal('gst_amount', 10, 2)->nullable()->after('gst_rate');
            $table->decimal('total_amount', 10, 2)->nullable()->after('gst_amount');
        });
    }

    public function down(): void
    {
        Schema::table('service_schedules', function (Blueprint $table) {
            $table->dropColumn(['actual_price', 'gst_rate', 'gst_amount', 'total_amount']);
        });
    }
};
