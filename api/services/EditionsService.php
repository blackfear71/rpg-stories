<?php
// Imports
require_once 'models/dtos/EditionOutputDTO.php';
require_once 'models/dtos/EditionResponseDTO.php';

require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private PDO $db;

    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;

    private EditionsRepository $editionsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->editionsRepository = new EditionsRepository($db);
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
     * Lecture de tous les enregistrements
     */
    public function getAllEditions(): array
    {
        // Lecture des éditions
        $editions = $this->editionsRepository->getAllEditions();

        return array_map(fn($edition) => new EditionOutputDTO(
            id: $edition->id,
            location: $edition->location,
            startDate: $edition->startDate,
            endDate: $edition->endDate,
            playerCount: $edition->playerCount
        ), $editions);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition(int $editionId): EditionResponseDTO
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture de l'édition
        $dataEdition = $this->editionsRepository->getEdition($editionId);

        if (!$dataEdition) {
            throw new \RuntimeException(MessageHelper::ERR_EDITION_NOT_FOUND);
        }

        // Vérification image existante et génération URL
        $picture = $dataEdition->picture ? FileHelper::checkFile('images', $dataEdition->picture) : null;

        // Formatage des données édition
        $edition = new EditionOutputDTO(
            id: $dataEdition->id,
            location: $dataEdition->location,
            startDate: $dataEdition->startDate,
            endDate: $dataEdition->endDate,
            picture: $picture,
            theme: $dataEdition->theme,
            challenge: $dataEdition->challenge
        );

        // Récupération des données cadeaux
        $gifts = $this->getGiftsService()->getEditionGifts($editionId);

        // Récupération des données participants
        $players = $this->getPlayersService()->getEditionPlayers($editionId);

        // Récupération des données édition
        return new EditionResponseDTO(
            edition: $edition,
            gifts: $gifts,
            players: $players
        );
    }

    /**
     * Lecture de la date de fin d'une édition par type
     */
    public function getEditionEndDateByType(int $id, string $table): ?\DateTimeImmutable
    {
        // Contrôle des données
        if (!$id || !$table) {
            return null;
        }

        // Lecture de la date de fin de l'édition selon le type
        switch ($table) {
            case 'editions':
                return $this->editionsRepository->getEditionEndDateByEditionId($id);
            case 'gifts':
                return $this->editionsRepository->getEditionEndDateByGiftId($id);
            case 'players':
                return $this->editionsRepository->getEditionEndDateByPlayerId($id);
            default:
                return null;
        }
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): array
    {
        // Retour vide si pas de recherche saisie
        if (empty($search)) {
            return [];
        }

        // Recherche des éditions
        $editions = $this->editionsRepository->getSearchEditions(trim($search));

        return array_map(fn($edition) => new EditionOutputDTO(
            id: $edition->id,
            location: $edition->location,
            startDate: $edition->startDate,
            endDate: $edition->endDate,
            playerCount: $edition->playerCount
        ), $editions);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition(EditionInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        $this->isValidEditionData($data);

        // Traitement des dates
        $startDate = new \DateTimeImmutable($data->startDate . ' ' . $data->startTime);
        $endDate = new \DateTimeImmutable($data->startDate . ' ' . $data->endTime);
        $endDate = $endDate->modify('+1 day');

        // Traitement de l'image
        $picture = $this->uploadImage(null, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            location: trim($data->location),
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme !== null ? trim($data->theme) : null,
            challenge: $data->challenge !== null ? trim($data->challenge) : null,
            createdBy: $userId
        );

        // Insertion
        if (!$this->editionsRepository->createEdition($edition)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition(int $editionId, EditionInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        $this->isValidEditionData($data);

        // Traitement des dates
        $startDate = new \DateTimeImmutable($data->startDate . ' ' . $data->startTime);
        $endDate = new \DateTimeImmutable($data->startDate . ' ' . $data->endTime);
        $endDate = $endDate->modify('+1 day');

        // Traitement de l'image
        $picture = $this->uploadImage($editionId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            id: $editionId,
            location: trim($data->location),
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme !== null ? trim($data->theme) : null,
            challenge: $data->challenge !== null ? trim($data->challenge) : null,
            updatedBy: $userId
        );

        // Modification
        if (!$this->editionsRepository->updateEdition($edition)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(int $editionId, int $userId): void
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des cadeaux
        $this->getGiftsService()->deleteGifts($editionId, $userId);

        // Suppression logique des participants
        $this->getPlayersService()->deletePlayers($editionId, $userId);

        // Suppression logique de l'édition
        if (!$this->editionsRepository->deleteEdition($editionId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData(EditionInputDTO $data): void
    {
        // Lieu renseigné
        if (trim($data->location) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_LOCATION);
        }

        // Date au bon format
        if (!DataHelper::isValidDateFormat($data->startDate, 'Y-m-d')) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_DATE);
        }

        // Heure de début au bon format
        if (!DataHelper::isValidDateFormat($data->startTime, 'H:i')) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_START_TIME);
        }

        // Heure de fin au bon format
        if (!DataHelper::isValidDateFormat($data->endTime, 'H:i')) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_END_TIME);
        }
    }

    /**
     * Traitement de l'image
     */
    private function uploadImage(?int $editionId, ?string $action, ?array $file): ?string
    {
        // Récupération de l'image de l'édition
        $picture = $editionId ? $this->editionsRepository->getEditionPicture($editionId) : null;

        // Traitement de l'image
        switch ($action) {
            case EnumAction::CREATE->value:
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage('images', $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return $fileName;
            case EnumAction::DELETE->value:
                // Suppression de l'ancienne image (hors création)
                if ($picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return null;
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }
}
