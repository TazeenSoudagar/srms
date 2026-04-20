<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendOtpRequest extends FormRequest
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
            'email' => [
                'required',
                'email',
                Rule::exists('users', 'email'),
            ],
            'type' => ['required', 'string', Rule::in(['login', 'password-reset', 'service_completion'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'The email is not registered.',
            'email.required' => 'The email field is required.',
            'email.email' => 'The email must be a valid email address.',
            'type.required' => 'The type field is required.',
        ];
    }

    /**
     * Additional validation after rules pass
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = User::where('email', $this->email)->first();

            if (! $user) {
                return;
            }

            if (! $user->is_active) {
                $validator->errors()->add(
                    'email',
                    'Please complete your registration. Check your email for the verification code or register again to resend OTP.'
                );

                return;
            }

            // Engineers must have documents uploaded by admin before they can log in
            if ($user->role?->name === 'Support Engineer' && ! $user->documents()->exists()) {
                    $validator->errors()->add(
                    'email',
                    'Your account is not yet fully set up. Please contact admin to upload your verification documents before logging in.'
                );
            }
        });
    }
}
