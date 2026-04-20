<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'service_request_id' => 'required|exists:service_requests,id',
            'scheduled_at' => 'required|date|after:now',
            'engineer_id' => [
                'nullable',
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->whereHas('role', function ($q) {
                        $q->where('name', 'Support Engineer');
                    });
                }),
            ],
            'notes' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'estimated_duration_minutes' => 'nullable|integer|min:15|max:480',
            'actual_price' => 'nullable|numeric|min:0|max:999999.99',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Decode service_request_id if it's hashed (not a numeric ID)
        if ($this->has('service_request_id') && is_string($this->service_request_id) && ! is_numeric($this->service_request_id)) {
            try {
                $decoded = \Vinkla\Hashids\Facades\Hashids::decode($this->service_request_id);
                $serviceRequestId = $decoded[0] ?? null;

                if ($serviceRequestId) {
                    $this->merge([
                        'service_request_id' => $serviceRequestId,
                    ]);
                }
            } catch (\Exception $e) {
                // If decoding fails, leave the value as is for validation to catch
            }
        }

        // Set customer_id from authenticated user if not provided
        if (! $this->has('customer_id')) {
            $this->merge([
                'customer_id' => $this->user()->id,
            ]);
        }

        // Set default estimated duration if not provided
        if (! $this->has('estimated_duration_minutes')) {
            $this->merge([
                'estimated_duration_minutes' => 60,
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'service_request_id.required' => 'Please select a service request.',
            'scheduled_at.required' => 'Please select a date and time for the schedule.',
            'scheduled_at.after' => 'The scheduled time must be in the future.',
            'estimated_duration_minutes.min' => 'Duration must be at least 15 minutes.',
            'estimated_duration_minutes.max' => 'Duration cannot exceed 8 hours.',
        ];
    }
}
