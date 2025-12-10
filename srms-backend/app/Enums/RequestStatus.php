<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Closed = 'closed';

    public static function options(): array
    {
        return [
            self::Open->value => 'Open',
            self::InProgress->value => 'In Progress',
            self::Closed->value => 'Closed',
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
