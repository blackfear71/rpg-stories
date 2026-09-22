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
            $picture = $dataCharacter->picture ? FileHelper::checkFile('characters', $dataCharacter->picture) : null;

            // Récupération des données campagne
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
        if (!$this->charactersRepository->createCharacter($character)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }

        // TODO : reste à mettre à jour la campagne avec l'id du personnage
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

        // TODO : reste à mettre à jour la campagne avec l'id du personnage
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

        // TODO : reste à mettre à jour les campagnes utilisant le personnage en supprimant l'id du personnage partout comme ci-dessous pour les sagas
        // Suppression du personnage des campagnes liées
        // $this->getCampaignsService()->updateCampaignsSaga($sagaId, $userId);
    }

    // TODO : à utiliser à la suppression de l'utilisateur
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
        $destination = 'characters';

        // Récupération de l'image de la campagne
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
