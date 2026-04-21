<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceScheduleRequest extends FormRequest
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
            'scheduled_at' => 'sometimes|date|after:now',
            'engineer_id' => [
                'nullable',
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->whereHas('role', function ($q) {
                        $q->where('name', 'Support Engineer');
                    });
                }),
            ],
            'status' => [
                'sometimes',
                Rule::in(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
            ],
            'notes' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'estimated_duration_minutes' => 'nullable|integer|min:15|max:480',
            'actual_price' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99',
                \Illuminate\Validation\Rule::when(
                    fn ($input) => $input->status === 'completed',
                    ['required', 'numeric', 'min:0']
                ),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'scheduled_at.after' => 'The scheduled time must be in the future.',
            'status.in' => 'Invalid status value.',
            'estimated_duration_minutes.min' => 'Duration must be at least 15 minutes.',
            'estimated_duration_minutes.max' => 'Duration cannot exceed 8 hours.',
            'actual_price.required' => 'An actual price is required before marking a schedule as completed.',
        ];
    }
}
