<?php
// Imports
require_once 'services/RewardsService.php';
require_once 'services/UsersService.php';

class RewardsController
{
    private const controllerName = 'RewardsController';

    private PDO $db;
    private RewardsService $rewardsService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->rewardsService = new RewardsService($db);
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
     * Insertion d'un enregistrement
     */
    public function createReward(?string $token, int $giftId, int $playerId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $this->rewardsService->createReward($giftId, $playerId, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_REWARD_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$giftId, $playerId]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteReward(?string $token, int $rewardId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->rewardsService->deleteReward($rewardId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$rewardId]);
        }
    }
}
