<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Invoice;
use App\Models\ServiceSchedule;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function generateForSchedule(ServiceSchedule $schedule): Invoice
    {
        $schedule->loadMissing([
            'serviceRequest.service',
            'customer',
            'engineer',
        ]);

        $actualPrice = (float) $schedule->actual_price;
        $gstRate = (float) $schedule->gst_rate;
        $gstAmount = round($actualPrice * ($gstRate / 100), 2);
        $totalAmount = round($actualPrice + $gstAmount, 2);

        $invoice = Invoice::create([
            'service_request_id' => $schedule->service_request_id,
            'schedule_id'        => $schedule->id,
            'invoice_number'     => Invoice::generateInvoiceNumber(),
            'actual_price'       => $actualPrice,
            'gst_rate'           => $gstRate,
            'gst_amount'         => $gstAmount,
            'total_amount'       => $totalAmount,
        ]);

        $pdf = Pdf::loadView('invoices.invoice', [
            'invoice'  => $invoice,
            'schedule' => $schedule,
            'request'  => $schedule->serviceRequest,
            'service'  => $schedule->serviceRequest->service,
            'customer' => $schedule->customer,
            'engineer' => $schedule->engineer,
        ]);

        $pdfPath = "invoices/{$invoice->invoice_number}.pdf";
        Storage::disk('local')->put($pdfPath, $pdf->output());

        $invoice->update(['pdf_path' => $pdfPath]);

        return $invoice;
    }
}
