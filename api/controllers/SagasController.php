<?php
// Imports
require_once 'models/dtos/SagaInputDTO.php';

require_once 'services/SagasService.php';
require_once 'services/UsersService.php';

class SagasController
{
    private const controllerName = 'SagasController';

    private PDO $db;
    private SagasService $sagasService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->sagasService = new SagasService($db);
    }

    /**
     * Instancie le UsersService si besoin
     */
    private function getUsersService(): UsersService
    {
        if ($this->usersService === null) {
            $this->usersService = new UsersService($this->db);
        }

        return $this->usersService;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getSagas(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture de tous les enregistrements
            $sagas = $this->sagasService->getSagas($user->id);

            // Succès
            ResponseHelper::success($sagas);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createSaga(?string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = SagaInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Insertion d'un enregistrement
            $this->sagasService->createSaga($dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [json_encode($data)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateSaga(?string $token, int $sagaId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = SagaInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->sagasService->updateSaga($sagaId, $dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$sagaId, json_encode($data)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteSaga(?string $token, int $sagaId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Suppression logique d'un enregistrement
            $this->sagasService->deleteSaga($sagaId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$sagaId]);
        }
    }
}
