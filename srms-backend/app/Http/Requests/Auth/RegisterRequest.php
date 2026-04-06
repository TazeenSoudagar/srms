<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->where(function ($query) {
                    // Only check uniqueness for active users
                    // Inactive users can re-register
                    return $query->where('is_active', true);
                }),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->where(function ($query) {
                    // Only check uniqueness for active users
                    return $query->where('is_active', true);
                }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name field is required.',
            'last_name.required' => 'The last name field is required.',
            'email.required' => 'The email field is required.',
            'email.email' => 'The email must be a valid email address.',
            'email.unique' => 'This email is already registered.',
            'phone.required' => 'The phone field is required.',
            'phone.unique' => 'This phone number is already registered.',
        ];
    }
}
