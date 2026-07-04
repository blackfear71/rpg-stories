<?php
// Imports
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';
require_once 'services/SseService.php';

class SseController
{
    private const controllerName = 'SseController';

    private PDO $db;
    private SseService $sseService;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->sseService = new SseService();
    }

    /**
     * Instancie le GiftsService si besoin
     */
    private function getGiftsService(): GiftsService
    {
        if ($this->giftsService === null) {
            $this->giftsService = new GiftsService($this->db);
        }

        return $this->giftsService;
    }

    /**
     * Instancie le PlayersService si besoin
     */
    private function getPlayersService(): PlayersService
    {
        if ($this->playersService === null) {
            $this->playersService = new PlayersService($this->db);
        }

        return $this->playersService;
    }

    /**
     * Flux SSE de récupération des participants et cadeaux d'une édition
     */
    public function getSseEdition(int $editionId): void
    {
        // Contrôle id renseigné
        if (!$editionId) {
            ResponseHelper::sse(MessageHelper::ERR_INVALID_ID, self::controllerName, __FUNCTION__, [$editionId]);
            echo $this->sseService->getSseEvent(EnumSseEvent::ERROR->value, 'Identifiant édition manquant');
            flush();
            return;
        }

        // Initialisation
        $this->sseService->initializeSse();

        // Envoi initial
        echo $this->sseService->getSseEvent(EnumSseEvent::IS_INITIALIZED->value, 'ok');
        flush();

        $lastGiftsHash = null;
        $lastPlayersHash = null;

        $startTime = time();
        $maxDuration = 50;

        // Boucle de récupération des données
        try {
            while (true) {
                // Coupe la connexion si le client se déconnecte
                if (connection_aborted()) {
                    break;
                }

                // Fermeture propre avant le timeout Nginx du serveur (60s)
                if ((time() - $startTime) >= $maxDuration) {
                    echo $this->sseService->getSseEvent(EnumSseEvent::IS_CLOSING->value, 'ok');
                    flush();
                    break;
                }

                // Evènement de maintien de la connexion
                echo $this->sseService->getSseEvent(EnumSseEvent::IS_ALIVE->value, 'ok');
                flush();

                // Evènement de récupération des cadeaux
                try {
                    $this->pollGifts($editionId, $lastGiftsHash);
                } catch (Exception $e) {
                    ResponseHelper::sse(MessageHelper::ERR_SSE_GIFTS, self::controllerName, __FUNCTION__, [$editionId]);
                }

                // Evènement de récupération des participants
                try {
                    $this->pollPlayers($editionId, $lastPlayersHash);
                } catch (Exception $e) {
                    ResponseHelper::sse(MessageHelper::ERR_SSE_PLAYERS, self::controllerName, __FUNCTION__, [$editionId]);
                }

                // Pause avant la prochaine boucle
                sleep(5);
            }
        } catch (Exception $e) {
            // Exception
            ResponseHelper::sse(MessageHelper::ERR_UNKNOWN_ERROR, self::controllerName, __FUNCTION__, [$editionId]);

            // Message d'erreur
            echo $this->sseService->getSseEvent(EnumSseEvent::ERROR->value, 'Exception levée SSE');
            flush();
        }
    }

    /**
     * Gestion des données cadeaux
     */
    private function pollGifts(int $editionId, ?string &$lastHash): void
    {
        // Lecture des cadeaux
        $gifts = $this->getGiftsService()->getEditionGifts($editionId);

        // Envoi du message
        if ($gifts !== null) {
            $newHash = md5(json_encode($gifts));

            if ($newHash !== $lastHash) {
                $lastHash = $newHash;

                echo $this->sseService->getSseEvent(EnumSseEvent::GET_GIFTS->value, $gifts);
                flush();
            }
        }
    }

    /**
     * Gestion des données participants
     */
    private function pollPlayers(int $editionId, ?string &$lastHash): void
    {
        // Lecture des participants
        $players = $this->getPlayersService()->getEditionPlayers($editionId);

        // Envoi du message
        if ($players !== null) {
            $newHash = md5(json_encode($players));

            if ($newHash !== $lastHash) {
                $lastHash = $newHash;

                echo $this->sseService->getSseEvent(EnumSseEvent::GET_PLAYERS->value, $players);
                flush();
            }
        }
    }
}
