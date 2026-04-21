<x-mail::message>
# Your Service is Complete!

Hi **{{ $customerName }}**,

Great news! Your **{{ $serviceName }}** service request **#{{ $requestNumber }}** has been successfully completed.

Please find your tax invoice attached to this email.

<x-mail::panel>
**Invoice Number:** {{ $invoice->invoice_number }}

**Service Charge:** ₹{{ number_format((float)$invoice->actual_price, 2) }}

**GST ({{ $invoice->gst_rate }}%):** ₹{{ number_format((float)$invoice->gst_amount, 2) }}

**Total Amount: ₹{{ number_format((float)$invoice->total_amount, 2) }}**
</x-mail::panel>

You can also view and download your invoice from the SRMS customer portal under **My Requests**.

Thank you for choosing our services. We hope to serve you again!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
