<?php
class DataHelper
{
    /**
     * Convertit les paramètres d'entrée en entiers
     */
    public static function parseIntParam(string $value): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT);

        if ($int === false) {
            ResponseHelper::error(MessageHelper::ERR_INVALID_PARAMETER, 'Router', __FUNCTION__, [$value]);
            exit;
        }

        return $int;
    }

    /**
     * Détermine si une date est valide selon le format souhaité
     */
    public static function isValidDateFormat(string $value, string $format): bool
    {
        $d = DateTime::createFromFormat($format, $value);
        return $d && $d->format($format) === $value;
    }
}
