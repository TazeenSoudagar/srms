<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRatingRequest extends FormRequest
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
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'review' => ['nullable', 'string', 'max:1000'],
            'professionalism_rating' => ['nullable', 'integer', 'between:1,5'],
            'timeliness_rating' => ['nullable', 'integer', 'between:1,5'],
            'quality_rating' => ['nullable', 'integer', 'between:1,5'],
            'is_anonymous' => ['nullable', 'boolean'],
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
            'rating.required' => 'Please provide an overall rating.',
            'rating.between' => 'Rating must be between 1 and 5.',
            'professionalism_rating.between' => 'Professionalism rating must be between 1 and 5.',
            'timeliness_rating.between' => 'Timeliness rating must be between 1 and 5.',
            'quality_rating.between' => 'Quality rating must be between 1 and 5.',
            'review.max' => 'Review must not exceed 1000 characters.',
        ];
    }
}
