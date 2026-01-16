<?php

declare(strict_types=1);

namespace App\Services;

use Vinkla\Hashids\Facades\Hashids;

class HashidsService
{
    /**
     * Encode an ID to a hashed string.
     *
     * @param  int|string  $id  The ID to encode
     * @return string The encoded hashid
     */
    public function encode(int|string $id): string
    {
        return Hashids::encode((int) $id);
    }

    /**
     * Decode a hashed string to an ID.
     *
     * @param  string  $hashid  The hashed ID to decode
     * @return int|null The decoded ID, or null if decoding fails
     */
    public function decode(string $hashid): ?int
    {
        try {
            $decoded = Hashids::decode($hashid);

            if (empty($decoded) || ! is_array($decoded) || ! isset($decoded[0])) {
                return null;
            }

            return (int) $decoded[0];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if a string is a valid hashid.
     *
     * @param  string  $value  The value to check
     * @return bool True if the value can be decoded, false otherwise
     */
    public function isValid(string $value): bool
    {
        return $this->decode($value) !== null;
    }
}
