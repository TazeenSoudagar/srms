<?php

declare(strict_types=1);

namespace App\Http\Requests\Complaint;

use App\Services\HashidsService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('assigned_engineer_id')) {
            $id = $this->input('assigned_engineer_id');
            if (! is_numeric($id)) {
                $decoded = app(HashidsService::class)->decode((string) $id);
                if ($decoded !== null) {
                    $this->merge(['assigned_engineer_id' => $decoded]);
                }
            }
        }
    }

    public function rules(): array
    {
        return [
            'assigned_engineer_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:pending,in_progress'],
        ];
    }
}
