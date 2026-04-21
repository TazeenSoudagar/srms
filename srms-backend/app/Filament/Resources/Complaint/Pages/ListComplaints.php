<?php

namespace App\Filament\Resources\Complaint\Pages;

use App\Filament\Resources\Complaint\ComplaintResource;
use Filament\Resources\Pages\ListRecords;

class ListComplaints extends ListRecords
{
    protected static string $resource = ComplaintResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
