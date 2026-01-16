<?php

declare(strict_types=1);

namespace App\Http\Requests\ServiceRequest;

use App\Models\Role;
use App\Models\User;
use App\Services\HashidsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignServiceRequestRequest extends FormRequest
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
     * Decode hashed assigned_to user ID if provided.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('assigned_to')) {
            $assignedTo = $this->input('assigned_to');

            // If assigned_to is not numeric, try to decode it as a Hashid
            if (! is_numeric($assignedTo)) {
                $hashidsService = app(HashidsService::class);
                $decodedId = $hashidsService->decode((string) $assignedTo);

                if ($decodedId !== null) {
                    $this->merge(['assigned_to' => $decodedId]);
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
        $supportEngineerRole = Role::where('name', 'Support Engineer')->first();

        // If Support Engineer role doesn't exist, fail validation early
        if ($supportEngineerRole === null) {
            return [
                'assigned_to' => [
                    'required',
                    'integer',
                    function ($attribute, $value, $fail) {
                        $fail('Support Engineer role does not exist in the system. Please contact administrator.');
                    },
                ],
            ];
        }

        return [
            'assigned_to' => [
                'required',
                'integer',
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($query) use ($supportEngineerRole) {
                    return $query->where('role_id', $supportEngineerRole->id)
                        ->where('is_active', true);
                }),
            ],
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
            'assigned_to.required' => 'Please select a support engineer to assign.',
            'assigned_to.exists' => 'The selected user must be an active support engineer.',
        ];
    }
}
