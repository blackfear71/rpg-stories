<?php
// Imports
require_once 'models/dtos/StoryInputDTO.php';

require_once 'services/StoriesService.php';
require_once 'services/UsersService.php';

class StoriesController
{
    private const controllerName = 'StoriesController';

    private PDO $db;
    private StoriesService $storiesService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->storiesService = new StoriesService($db);
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
     * Lecture des enregistrements d'une campagne
     */
    public function getCampaignStories(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture de tous les enregistrements
            $stories = $this->storiesService->getCampaignStories($campaignId, $user->id);

            // Succès
            ResponseHelper::success($stories);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createStory(?string $token, int $campaignId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = StoryInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Insertion d'un enregistrement
            $this->storiesService->createStory($campaignId, $dataDTO, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId, json_encode($data)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateStory(?string $token, int $storyId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = StoryInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->storiesService->updateStory($storyId, $dataDTO, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$storyId, json_encode($data)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteStory(?string $token, int $storyId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Suppression logique d'un enregistrement
            $this->storiesService->deleteStory($storyId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$storyId]);
        }
    }
}
