<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\HashidsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashidsService = app(HashidsService::class);

        return [
            'id' => $hashidsService->encode($this->id),
            'body' => $this->body,
            'user' => $this->when($this->relationLoaded('user') && $this->user, fn () => [
                'id' => $hashidsService->encode($this->user->id),
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'name' => trim($this->user->first_name.' '.$this->user->last_name),
                'email' => $this->user->email,
                'role' => $this->user->role ? ['name' => $this->user->role->name] : null,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
