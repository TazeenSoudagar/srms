<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ContactEnquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContactEnquiryReceived extends Notification
{
    use Queueable;

    public function __construct(public ContactEnquiry $enquiry) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'format'         => 'filament',
            'title'          => 'New Contact Enquiry',
            'body'           => "New enquiry from {$this->enquiry->name} ({$this->enquiry->email}): {$this->enquiry->subject}",
            'enquiry_id'     => $this->enquiry->id,
            'enquiry_number' => $this->enquiry->enquiry_number,
            'icon'           => 'heroicon-o-envelope',
            'color'          => 'info',
            'url'            => '/admin/contact-enquiries/' . $this->enquiry->id,
        ];
    }
}
