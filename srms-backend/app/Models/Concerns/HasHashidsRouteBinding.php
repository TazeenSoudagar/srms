<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Services\HashidsService;

trait HasHashidsRouteBinding
{
    /**
     * Retrieve the model for bound value.
     * Automatically decodes Hashids before looking up the model.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $hashidsService = app(HashidsService::class);

        // Try to decode Hashids first
        $decodedId = $hashidsService->decode($value);

        if ($decodedId !== null) {
            return $this->where($field ?? $this->getRouteKeyName(), $decodedId)->first();
        }

        // Fallback: try as integer ID (for backward compatibility)
        if (is_numeric($value)) {
            return $this->where($field ?? $this->getRouteKeyName(), (int) $value)->first();
        }

        // Return null if nothing matches
        return null;
    }
}
