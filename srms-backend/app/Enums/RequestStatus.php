<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Closed = 'closed';
    case Cancelled = 'cancelled';

    public static function options(): array
    {
        return [
            self::Open->value => 'Open',
            self::InProgress->value => 'In Progress',
            self::Closed->value => 'Closed',
            self::Cancelled->value => 'Cancelled',
        ];
    }

    public static function getLabel(string $value): string
    {
        return self::options()[$value] ?? $value;
    }

    public static function getValue(string $label): string
    {
        return array_search($label, self::options()) ?? $label;
    }
}
