<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
        .header { background: #1e3a5f; color: #ffffff; padding: 28px 32px; }
        .header h1 { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
        .header .subtitle { font-size: 11px; color: #a0b8d8; margin-top: 4px; }
        .divider { height: 4px; background: #f59e0b; }
        .body { padding: 28px 32px; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .meta-block { }
        .meta-block .label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .meta-block .value { font-size: 13px; font-weight: bold; color: #111827; }
        .meta-block .value-sm { font-size: 12px; color: #374151; margin-top: 2px; }
        .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
        .parties-row { display: flex; margin-bottom: 24px; }
        .party { width: 50%; padding-right: 20px; }
        .party .name { font-size: 13px; font-weight: bold; color: #111827; margin-bottom: 2px; }
        .party .detail { font-size: 11px; color: #4b5563; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
        tbody td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; vertical-align: top; }
        .totals-table { width: 280px; margin-left: auto; }
        .totals-table td { padding: 8px 12px; border: none; font-size: 12px; }
        .totals-table .total-row { background: #1e3a5f; color: white; font-weight: bold; font-size: 14px; }
        .totals-table .total-row td { padding: 10px 12px; }
        .gst-note { font-size: 10px; color: #9ca3af; margin-top: 6px; text-align: right; }
        .status-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 20px; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 10px; text-align: center; font-size: 10px; color: #9ca3af; line-height: 1.8; }
        .footer strong { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TAX INVOICE</h1>
        <div class="subtitle">{{ config('app.name', 'SRMS') }} — Service Request Management System</div>
    </div>
    <div class="divider"></div>

    <div class="body">
        {{-- Invoice Meta --}}
        <div class="meta-row">
            <div class="meta-block">
                <div class="label">Invoice Number</div>
                <div class="value">{{ $invoice->invoice_number }}</div>
                <div class="label" style="margin-top:10px;">Invoice Date</div>
                <div class="value-sm">{{ $invoice->created_at->format('d M Y') }}</div>
            </div>
            <div class="meta-block" style="text-align:right;">
                <div class="label">Request Number</div>
                <div class="value">{{ $request->request_number }}</div>
                <div class="label" style="margin-top:10px;">Completion Date</div>
                <div class="value-sm">{{ $schedule->completed_at?->format('d M Y') ?? $invoice->created_at->format('d M Y') }}</div>
            </div>
        </div>

        {{-- Parties --}}
        <div class="section-title">Bill To / Service By</div>
        <div class="parties-row">
            <div class="party">
                <div class="label">Bill To</div>
                <div class="name" style="margin-top:6px;">{{ $customer->first_name }} {{ $customer->last_name }}</div>
                <div class="detail">{{ $customer->email }}</div>
                @if($customer->phone)
                <div class="detail">{{ $customer->phone }}</div>
                @endif
            </div>
            <div class="party">
                <div class="label">Service Provided By</div>
                @if($engineer)
                <div class="name" style="margin-top:6px;">{{ $engineer->first_name }} {{ $engineer->last_name }}</div>
                <div class="detail">{{ $engineer->email }}</div>
                @else
                <div class="detail" style="margin-top:6px;">Assigned Engineer</div>
                @endif
            </div>
        </div>

        {{-- Service Details --}}
        <div class="section-title">Service Details</div>
        <table>
            <thead>
                <tr>
                    <th style="width:35%;">Service</th>
                    <th style="width:45%;">Description</th>
                    <th style="width:20%; text-align:right;">Scheduled Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $service->name }}</td>
                    <td>{{ $request->title }}</td>
                    <td style="text-align:right;">{{ $schedule->scheduled_at->format('d M Y, h:i A') }}</td>
                </tr>
            </tbody>
        </table>

        {{-- Status --}}
        <div class="status-badge">&#10003; SERVICE COMPLETED</div>

        {{-- Pricing --}}
        <table class="totals-table">
            <tbody>
                <tr>
                    <td style="color:#6b7280;">Service Charge</td>
                    <td style="text-align:right; font-weight:bold;">&#8377;{{ number_format((float)$invoice->actual_price, 2) }}</td>
                </tr>
                <tr>
                    <td style="color:#6b7280;">GST ({{ $invoice->gst_rate }}%)</td>
                    <td style="text-align:right; font-weight:bold;">&#8377;{{ number_format((float)$invoice->gst_amount, 2) }}</td>
                </tr>
            </tbody>
            <tbody>
                <tr class="total-row">
                    <td style="color:#ffffff;">Total Amount</td>
                    <td style="text-align:right; color:#ffffff;">&#8377;{{ number_format((float)$invoice->total_amount, 2) }}</td>
                </tr>
            </tbody>
        </table>
        <div class="gst-note">GST @ {{ $invoice->gst_rate }}% | GSTIN: As per prevailing norms</div>
    </div>

    <div class="footer" style="padding: 16px 32px 24px;">
        <strong>{{ config('app.name', 'SRMS') }}</strong><br>
        Thank you for choosing our services. This is a computer-generated invoice and does not require a signature.<br>
        For queries, contact us at support@srms.app
    </div>
</body>
</html>
