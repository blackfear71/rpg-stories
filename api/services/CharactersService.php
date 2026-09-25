<?php
// Imports
require_once 'models/dtos/CharacterOutputDTO.php';

require_once 'services/CampaignsService.php';

require_once 'repositories/CharactersRepository.php';

class CharactersService
{
    private PDO $db;

    private ?CampaignsService $campaignsService = null;

    private CharactersRepository $charactersRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->charactersRepository = new CharactersRepository($db);
    }

    /**
     * Instancie le CampaignsService si besoin
     */
    private function getCampaignsService(): CampaignsService
    {
        if ($this->campaignsService === null) {
            $this->campaignsService = new CampaignsService($this->db);
        }

        return $this->campaignsService;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getCharacters(int $userId): array
    {
        // Lecture des personnages
        $characters = $this->charactersRepository->getCharacters($userId);

        // Génération des DTO
        return array_map(function ($character) {
            // Vérification de l'image existante et génération de l'URL
            $picture = $character->picture ? FileHelper::checkFile('images/characters', $character->picture) : null;

            // Récupération des données personnage
            return new CharacterOutputDTO(
                id: $character->id,
                name: $character->name,
                picture: $picture
            );
        }, $characters);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getCharacter(int $campaignId, int $userId): ?CharacterOutputDTO
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture du personnage
        $dataCharacter = $this->charactersRepository->getCharacter($campaignId, $userId);

        if ($dataCharacter) {
            // Vérification image existante et génération URL
            $picture = $dataCharacter->picture ? FileHelper::checkFile('images/characters', $dataCharacter->picture) : null;

            // Récupération des données personnage
            return new CharacterOutputDTO(
                id: $dataCharacter->id,
                name: $dataCharacter->name,
                picture: $picture
            );
        } else {
            return null;
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCharacter(int $campaignId, CharacterInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        $this->isValidCreateCharacterData($campaignId, $data);

        // Traitement de l'image
        $picture = $this->processImage(null, $userId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $character = new Character(
            name: trim($data->name),
            picture: $picture,
            createdBy: $userId
        );

        // Insertion
        $characterId = $this->charactersRepository->createCharacter($character);

        if (!$characterId) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }

        // Mise à jour de la campagne avec le personnage
        $this->getCampaignsService()->updateCampaignCharacter($campaignId, $characterId, $userId);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateCharacter(int $characterId, CharacterInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        $this->isValidUpdateCharacterData($characterId, $data);

        // Traitement de l'image
        $picture = $this->processImage($characterId, $userId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $character = new Character(
            id: $characterId,
            name: trim($data->name),
            picture: $picture,
            createdBy: $userId,
            updatedBy: $userId
        );

        // Modification
        if (!$this->charactersRepository->updateCharacter($character)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Import d'un personnage
     */
    public function importCharacter(ImportCharacterInputDTO $data, int $userId): void
    {
        // Mise à jour de la campagne avec le personnage
        $this->getCampaignsService()->updateCampaignCharacter($data->campaignId, $data->characterId, $userId);
    }

    /**
     * Détachement d'un personnage
     */
    public function detachCharacter(int $campaignId, int $userId): void
    {
        // Mise à jour de la campagne avec le personnage
        $this->getCampaignsService()->updateCampaignCharacter($campaignId, NULL, $userId);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCharacter(int $characterId, int $userId): void
    {
        // Contrôle des données
        if (!$characterId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique du personnage
        if (!$this->charactersRepository->deleteCharacter($characterId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }

        // Suppression du personnage des campagnes liées
        $this->getCampaignsService()->deleteCampaignsCharacter($characterId, $userId);
    }

    /**
     * Suppression logique des enregistrements d'un utilisateur
     */
    public function deleteCharactersByUserId(int $userDeleteId, int $userId): void
    {
        // Contrôle des données
        if (!$userDeleteId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des personnages
        if (!$this->charactersRepository->deleteCharactersByUserId($userDeleteId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création)
     */
    private function isValidCreateCharacterData(int $campaignId, CharacterInputDTO $data): void
    {
        // Id campagne renseigné
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }
    }

    /**
     * Contrôle des données saisies (modification)
     */
    private function isValidUpdateCharacterData(int $characterId, CharacterInputDTO $data): void
    {
        // Identifiant personnage renseigné
        if (!$characterId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseignée
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }
    }

    /**
     * Traitement de l'image
     */
    private function processImage(?int $characterId, int $userId, ?string $action, ?array $file): ?string
    {
        $destination = 'images/characters';

        // Récupération de l'image du personnage
        $picture = $characterId ? $this->charactersRepository->getCharacterPicture($characterId, $userId) : null;

        // Traitement de l'image
        switch ($action) {
            case EnumAction::CREATE->value:
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage($destination, $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile($destination, $picture);
                }

                return $fileName;
            case EnumAction::DELETE->value:
                // Suppression de l'ancienne image (hors création)
                if ($picture) {
                    FileHelper::deleteFile($destination, $picture);
                }

                return null;
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }
}
