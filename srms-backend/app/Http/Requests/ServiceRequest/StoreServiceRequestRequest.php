<?php

declare(strict_types=1);

namespace App\Http\Requests\ServiceRequest;

use App\Enums\RequestPriority;
use App\Services\HashidsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    /**
     * Prepare the data for validation.
     * Decode hashed service_id if provided.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('service_id')) {
            $serviceId = $this->input('service_id');

            // If service_id is not numeric, try to decode it as a Hashid
            if (! is_numeric($serviceId)) {
                $hashidsService = app(HashidsService::class);
                $decodedId = $hashidsService->decode((string) $serviceId);

                if ($decodedId !== null) {
                    $this->merge(['service_id' => $decodedId]);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['nullable', 'string', Rule::enum(RequestPriority::class)],
            'due_date' => ['nullable', 'date', 'after:today'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Please select a service.',
            'service_id.exists' => 'The selected service does not exist.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'priority.required' => 'Priority is required.',
            'priority.enum' => 'Invalid priority value.',
            'due_date.date' => 'Due date must be a valid date.',
            'due_date.after' => 'Due date must be after today.',
        ];
    }
}
