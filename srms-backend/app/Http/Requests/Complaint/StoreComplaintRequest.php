<?php

declare(strict_types=1);

namespace App\Http\Requests\Complaint;

use App\Services\HashidsService;
use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('service_request_id')) {
            $id = $this->input('service_request_id');
            if (! is_numeric($id)) {
                $decoded = app(HashidsService::class)->decode((string) $id);
                if ($decoded !== null) {
                    $this->merge(['service_request_id' => $decoded]);
                }
            }
        }
    }

    public function rules(): array
    {
        return [
            'service_request_id' => ['required', 'integer', 'exists:service_requests,id'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'file', 'image', 'max:5120', 'mimes:jpg,jpeg,png,webp'],
        ];
    }

    public function messages(): array
    {
        return [
            'service_request_id.required' => 'Please select a service request.',
            'service_request_id.exists' => 'The selected service request does not exist.',
            'description.required' => 'Please describe your complaint.',
            'description.min' => 'Complaint description must be at least 10 characters.',
            'images.required' => 'At least one image is required.',
            'images.min' => 'At least one image is required.',
            'images.*.image' => 'Only image files are allowed (jpg, jpeg, png, webp).',
            'images.*.max' => 'Each image must not exceed 5MB.',
        ];
    }
}
