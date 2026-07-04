<?php
class LoggerHelper
{
    private static $env = null;

    /**
     * Enregistre un message dans le fichier de log journalier
     * @param $message Message à logguer
     * @param $level Niveau de gravité (ex: ERROR, INFO, WARNING)
     */
    public static function log(string $message, string $level = 'ERROR'): void
    {
        // Récupération du dossier de logs depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        if (isset(self::$env['FILES_DIR']) && !empty(self::$env['FILES_DIR'])) {
            $logDir = self::$env['FILES_DIR'] . '/logs';

            // Contrôle que le dossier de logs existe
            if (!is_dir($logDir)) {
                mkdir($logDir, 0775, true);
            }

            // Nom du fichier, ex : logs/error_logs_2026-07-04.log
            switch ($level) {
                case 'INFO':
                    $filename = $logDir . '/info_logs_' . date('Y-m-d') . '.log';
                    break;
                case 'SSE':
                    $filename = $logDir . '/sse_logs_' . date('Y-m-d') . '.log';
                    break;
                case 'WARNING':
                    $filename = $logDir . '/warning_logs_' . date('Y-m-d') . '.log';
                    break;
                case 'ERROR':
                default:
                    $filename = $logDir . '/error_logs_' . date('Y-m-d') . '.log';
                    break;
            }

            // Format : [2026-07-04 23:52:02] [ERROR] Message
            $date = date('Y-m-d H:i:s');
            $formatted = "[$date] [$level] $message\n";

            error_log($formatted, 3, $filename);
        }
    }
}
