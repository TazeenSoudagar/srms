<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
        $hashidsService = app(HashidsService::class);

        return [
            'message' => 'OTP verified successfully',
            'token' => $this->token,
            'user' => [
                'id' => $hashidsService->encode($this->id),
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'phone' => $this->phone,
                'is_active' => $this->is_active,
                'avatar' => $this->avatar ? [
                    'id' => $hashidsService->encode($this->avatar->id),
                    'name' => $this->avatar->name,
                    'url' => config('app.url').Storage::url($this->avatar->url),
                ] : null,
                'role' => [
                    'id' => $this->role->id ?? null,
                    'name' => $this->role->name ?? null,
                ],
            ],
        ];
    }
}
