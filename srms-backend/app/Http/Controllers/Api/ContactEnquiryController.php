<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactEnquiryRequest;
use App\Models\ContactEnquiry;
use App\Models\User;
use App\Notifications\ContactEnquiryReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;

class ContactEnquiryController extends Controller
{
    public function store(StoreContactEnquiryRequest $request): JsonResponse
    {
        $enquiry = ContactEnquiry::create([
            'enquiry_number' => ContactEnquiry::generateEnquiryNumber(),
            'name'           => $request->input('name'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone'),
            'subject'        => $request->input('subject'),
            'message'        => $request->input('message'),
            'status'         => 'new',
        ]);

        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Admin'))->get();
        Notification::send($admins, new ContactEnquiryReceived($enquiry));

        return response()->json([
            'message' => 'Your enquiry has been submitted. We will get back to you shortly.',
        ], 201);
    }
}
