<?php
// Imports
require_once 'models/dtos/CampaignInputDTO.php';

require_once 'services/CampaignsService.php';
require_once 'services/UsersService.php';

class CampaignsController
{
    private const controllerName = 'CampaignsController';

    private PDO $db;
    private CampaignsService $campaignsService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->campaignsService = new CampaignsService($db);
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
    public function getCampaigns(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture de tous les enregistrements
            $campaigns = $this->campaignsService->getCampaigns($user->id);

            // Succès
            ResponseHelper::success($campaigns);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getCampaign(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture d'un enregistrement
            $campaign = $this->campaignsService->getCampaign($campaignId, $user->id);

            // Succès
            ResponseHelper::success($campaign);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }

    /**
     * Lecture des campagnes recherchées
     */
    public function getSearchCampaigns(?string $token, string $search): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture de tous les enregistrements recherchés
            $campaigns = $this->campaignsService->getSearchCampaigns($search, $user->id);

            // Succès
            ResponseHelper::success($campaigns);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$search]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCampaign(?string $token, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = CampaignInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Insertion d'un enregistrement
            $this->campaignsService->createCampaign($dataDTO, $file, $user->id);

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
    public function updateCampaign(?string $token, int $campaignId, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = CampaignInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->campaignsService->updateCampaign($campaignId, $dataDTO, $file, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId, json_encode($data), json_encode($file)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCampaign(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Suppression logique d'un enregistrement
            $this->campaignsService->deleteCampaign($campaignId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }
}
