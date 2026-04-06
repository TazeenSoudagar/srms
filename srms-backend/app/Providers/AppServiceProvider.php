<?php

namespace App\Providers;

use App\Models\ServiceRequest;
use App\Models\ServiceSchedule;
use App\Observers\ServiceRequestObserver;
use App\Observers\ServiceScheduleObserver;
use App\Services\HashidsService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Schema::defaultStringLength(191);

        $this->app->singleton(HashidsService::class, function ($app) {
            return new HashidsService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Policies are auto-discovered by Laravel
        // They follow the naming convention: ModelPolicy for Model

        // Register model observers
        ServiceRequest::observe(ServiceRequestObserver::class);
        ServiceSchedule::observe(ServiceScheduleObserver::class);
    }
}
