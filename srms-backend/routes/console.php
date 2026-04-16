<?php

use App\Jobs\Analytics\UpdateServicePopularityJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recalculate service popularity scores and refresh trending flags daily at midnight
Schedule::job(new UpdateServicePopularityJob())->daily();
