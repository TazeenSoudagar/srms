<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('schedule_id')->constrained('service_schedules')->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->decimal('actual_price', 10, 2);
            $table->decimal('gst_rate', 5, 2)->default(18.00);
            $table->decimal('gst_amount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('pdf_path')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('service_request_id');
            $table->index('schedule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
