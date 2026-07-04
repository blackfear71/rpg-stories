<?php
// Imports
require_once 'models/dtos/EditionInputDTO.php';

require_once 'services/EditionsService.php';
require_once 'services/UsersService.php';

class EditionsController
{
    private const controllerName = 'EditionsController';

    private PDO $db;
    private EditionsService $editionsService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->editionsService = new EditionsService($db);
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
    public function getAllEditions(): void
    {
        try {
            // Lecture de tous les enregistrements
            $editions = $this->editionsService->getAllEditions();

            // Succès
            ResponseHelper::success($editions);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition(int $editionId): void
    {
        try {
            // Lecture d'un enregistrement
            $edition = $this->editionsService->getEdition($editionId);

            // Succès
            ResponseHelper::success($edition);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId]);
        }
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): void
    {
        try {
            // Lecture de tous les enregistrements recherchés
            $editions = $this->editionsService->getSearchEditions($search);

            // Succès
            ResponseHelper::success($editions);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$search]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition(?string $token, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = EditionInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Insertion d'un enregistrement
            $this->editionsService->createEdition($dataDTO, $file, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [json_encode($data), json_encode($file)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition(?string $token, int $editionId, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = EditionInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Modification d'un enregistrement
            $this->editionsService->updateEdition($editionId, $dataDTO, $file, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId, json_encode($data), json_encode($file)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(?string $token, int $editionId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->editionsService->deleteEdition($editionId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId]);
        }
    }
}
