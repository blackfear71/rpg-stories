<?php
// Imports
require_once 'models/dtos/SagaOutputDTO.php';

require_once 'repositories/SagasRepository.php';

class SagasService
{
    private PDO $db;

    private SagasRepository $sagasRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->sagasRepository = new SagasRepository($db);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getSagas(int $userId): array
    {
        // Lecture des sagas
        $sagas = $this->sagasRepository->getSagas($userId);

        return array_map(fn($saga) => new SagaOutputDTO(
            id: $saga->id,
            name: $saga->name
        ), $sagas);
    }

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

        // TODO : proposer de supprimer les campagnes/histoires liées ? => si non update des campagnes pour effacer leur saga, si oui suppression logique des campagnes et histoires

        // Suppression logique de la saga
        if (!$this->sagasRepository->deleteSaga($sagaId, $userId)) {
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
