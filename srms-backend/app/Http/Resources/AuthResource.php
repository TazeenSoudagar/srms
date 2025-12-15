<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Vinkla\Hashids\Facades\Hashids;

class AuthResource extends JsonResource
{
    protected string $token;

    public function __construct($resource, string $token)
    {
        parent::__construct($resource);
        $this->token = $token;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'message' => 'OTP verified successfully',
            'token' => $this->token,
            'user' => [
                'id' => Hashids::encode($this->id),
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'phone' => $this->phone,
                'is_active' => $this->is_active,
                'role' => [
                    'id' => $this->role->id ?? null,
                    'name' => $this->role->name ?? null,
                ],
            ],
        ];
    }
}
