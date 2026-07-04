<?php
class SseService
{
    /**
     * Initialisation des paramètres SSE
     */
    public function initializeSse(): void
    {
        // Évite la limite de temps PHP
        set_time_limit(0);

        // Vider tous les tampons éventuels
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        ob_implicit_flush(true);
    }

    /**
     * Génère un bloc SSE (event + data)
     */
    public function getSseEvent(string $event, mixed $data): string
    {
        return "event: {$event}\n"
            . "data: " . (is_string($data) ? $data : json_encode($data)) . "\n\n";
    }
}
