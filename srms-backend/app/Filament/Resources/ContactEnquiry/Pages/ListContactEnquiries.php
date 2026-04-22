<?php

namespace App\Filament\Resources\ContactEnquiry\Pages;

use App\Filament\Resources\ContactEnquiry\ContactEnquiryResource;
use Filament\Resources\Pages\ListRecords;

class ListContactEnquiries extends ListRecords
{
    protected static string $resource = ContactEnquiryResource::class;
}
