<?php

namespace App\Enums;

enum RequestPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    public static function options(): array
    {
        return [
            self::Low->value => 'Low',
            self::Medium->value => 'Medium',
            self::High->value => 'High',
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
