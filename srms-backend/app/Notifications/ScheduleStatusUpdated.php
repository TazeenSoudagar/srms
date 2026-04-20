<?php

namespace App\Notifications;

use App\Models\ServiceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Vinkla\Hashids\Facades\Hashids;

class ScheduleStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(
        public ServiceSchedule $schedule,
        public string $oldStatus,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusLabels = [
            'pending'     => 'Pending',
            'confirmed'   => 'Confirmed',
            'in_progress' => 'In Progress',
            'completed'   => 'Completed',
            'cancelled'   => 'Cancelled',
        ];

        $newStatus = $this->schedule->status;
        $newLabel = $statusLabels[$newStatus] ?? $newStatus;

        $data = [
            'format'             => 'filament',
            'title'              => "Schedule {$newLabel}",
            'body'            => $this->buildMessage($newLabel),
            'schedule_id'        => $this->schedule->hashed_id,
            'service_request_id' => Hashids::encode($this->schedule->service_request_id),
            'old_status'         => $this->oldStatus,
            'new_status'         => $newStatus,
            'scheduled_at'       => $this->schedule->scheduled_at->toISOString(),
            'icon'               => $this->resolveIcon($newStatus),
            'color'              => $this->resolveColor($newStatus),
        ];

        // Include pricing breakdown when confirmed
        if ($newStatus === 'confirmed' && $this->schedule->actual_price !== null) {
            $data['actual_price']  = (float) $this->schedule->actual_price;
            $data['gst_rate']      = (float) $this->schedule->gst_rate;
            $data['gst_amount']    = (float) $this->schedule->gst_amount;
            $data['total_amount']  = (float) $this->schedule->total_amount;
        }

        // Include invoice info when completed
        if ($newStatus === 'completed') {
            $invoice = $this->schedule->invoice;
            if ($invoice) {
                $data['invoice_number'] = $invoice->invoice_number;
                $data['has_pdf']        = ! empty($invoice->pdf_path);
                $data['total_amount']   = (float) $invoice->total_amount;
            }
        }

        return $data;
    }

    private function buildMessage(string $newLabel): string
    {
        $date = $this->schedule->scheduled_at->format('M j, Y g:i A');
        $newStatus = $this->schedule->status;

        if ($newStatus === 'confirmed' && $this->schedule->actual_price !== null) {
            $total = '₹' . number_format((float) $this->schedule->total_amount, 2);
            return "Your appointment on {$date} has been confirmed. Total payable: {$total} (incl. 18% GST).";
        }

        if ($newStatus === 'completed') {
            $invoice = $this->schedule->invoice;
            if ($invoice) {
                $total = '₹' . number_format((float) $invoice->total_amount, 2);
                return "Your service on {$date} is completed. Invoice {$invoice->invoice_number} ({$total}) has been emailed to you.";
            }
            return "Your appointment on {$date} has been marked as {$newLabel}.";
        }

        if ($newStatus === 'cancelled') {
            return "Your appointment scheduled for {$date} has been cancelled.";
        }

        return "Your appointment scheduled for {$date} is now {$newLabel}.";
    }

    private function resolveIcon(string $status): string
    {
        return match ($status) {
            'confirmed'   => 'heroicon-o-check-circle',
            'in_progress' => 'heroicon-o-wrench-screwdriver',
            'completed'   => 'heroicon-o-check-badge',
            'cancelled'   => 'heroicon-o-x-circle',
            default       => 'heroicon-o-calendar',
        };
    }

    private function resolveColor(string $status): string
    {
        return match ($status) {
            'confirmed'   => 'success',
            'in_progress' => 'info',
            'completed'   => 'success',
            'cancelled'   => 'danger',
            default       => 'warning',
        };
    }
}
