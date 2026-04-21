<?php

namespace App\Enums;

enum ComplaintStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Closed = 'closed';

    public static function options(): array
    {
        return [
            self::Pending->value => 'Pending',
            self::InProgress->value => 'In Progress',
            self::Closed->value => 'Closed',
        ];
    }

    public static function getLabel(string $value): string
    {
        return self::options()[$value] ?? $value;
    }
}
