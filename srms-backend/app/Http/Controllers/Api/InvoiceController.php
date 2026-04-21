<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    /**
     * Download the invoice PDF for a completed service request.
     */
    public function download(Request $request, ServiceRequest $serviceRequest): StreamedResponse
    {
        $this->authorize('view', $serviceRequest);

        $invoice = $serviceRequest->invoice()->first();

        if (! $invoice || ! $invoice->pdf_path) {
            abort(404, 'Invoice not found for this service request.');
        }

        if (! Storage::disk('local')->exists($invoice->pdf_path)) {
            abort(404, 'Invoice PDF file not found.');
        }

        return Storage::disk('local')->download(
            $invoice->pdf_path,
            "{$invoice->invoice_number}.pdf",
            ['Content-Type' => 'application/pdf']
        );
    }
}
