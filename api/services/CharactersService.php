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
    public function getCharacter(int $campaignId, int $userId): CharacterOutputDTO
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture du personnage
        $dataCharacter = $this->charactersRepository->getCharacter($campaignId, $userId);

        if (!$dataCharacter) {
            throw new \RuntimeException(MessageHelper::ERR_CHARACTER_NOT_FOUND);
        }

        // Vérification image existante et génération URL
        $picture = $dataCharacter->picture ? FileHelper::checkFile('characters', $dataCharacter->picture) : null;

        // Récupération des données campagne
        return new CharacterOutputDTO(
            id: $dataCharacter->id,
            name: $dataCharacter->name,
            picture: $picture
        );
    }

    // TODO : continuer ici
    /**
     * Insertion d'un enregistrement
     */
    public function createSaga(SagaInputDTO $data, int $userId): void
    {
        // Contrôle des données
        $this->isValidSagaData($data);

        // Construction de l'objet
        $saga = new Saga(
            name: trim($data->name),
            createdBy: $userId
        );

        // Insertion
        if (!$this->sagasRepository->createSaga($saga)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateSaga(int $sagaId, SagaInputDTO $data, int $userId): void
    {
        // Contrôle des données
        if (!$sagaId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        $this->isValidSagaData($data);

        // Construction de l'objet
        $saga = new Saga(
            id: $sagaId,
            name: trim($data->name),
            createdBy: $userId,
            updatedBy: $userId
        );

        // Modification
        if (!$this->sagasRepository->updateSaga($saga)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteSaga(int $sagaId, int $userId): void
    {
        // Contrôle des données
        if (!$sagaId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique de la saga
        if (!$this->sagasRepository->deleteSaga($sagaId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }

        // Suppression de la saga des campagnes liées
        $this->getCampaignsService()->updateCampaignsSaga($sagaId, $userId);
    }

    /**
     * Suppression logique des enregistrements d'un utilisateur
     */
    public function deleteSagasByUserId(int $userDeleteId, int $userId): void
    {
        // Contrôle des données
        if (!$userDeleteId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des sagas
        if (!$this->sagasRepository->deleteSagasByUserId($userDeleteId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidSagaData(SagaInputDTO $data): void
    {
        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }
    }
}
