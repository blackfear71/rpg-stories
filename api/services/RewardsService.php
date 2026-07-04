<?php
// Imports
require_once 'services/EditionsService.php';
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/RewardsRepository.php';

class RewardsService
{
    private PDO $db;

    private ?EditionsService $editionsService = null;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;

    private RewardsRepository $rewardsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->rewardsRepository = new RewardsRepository($db);
    }

    /**
     * Instancie le EditionsService si besoin
     */
    private function getEditionsService(): EditionsService
    {
        if ($this->editionsService === null) {
            $this->editionsService = new EditionsService($this->db);
        }

        return $this->editionsService;
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
     * Récupération du nombre d'attributions d'un cadeau
     */
    public function getRewardCount(int $giftId): int
    {
        // Contrôle des données
        if (!$giftId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        return $this->rewardsRepository->getRewardCount($giftId);
    }

    /**
     * Récupération des cadeaux d'un participant
     */
    public function getPlayerRewards(int $playerId): array
    {
        // Contrôle des données
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture des récompenses
        $rewards = $this->rewardsRepository->getPlayerRewards($playerId);

        // Récupération des données récompenses
        return array_map(fn($reward) => new RewardOutputDTO(
            id: $reward->id,
            giftId: $reward->giftId,
            giftName: $reward->giftName
        ), $rewards);
    }

    /**
     * Attribution d'un cadeau
     */
    public function createReward(int $giftId, int $playerId, UserOutputDTO $user): void
    {
        // Récupération du cadeau
        $gift = $this->getGiftsService()->getGift($giftId);

        // Récupération du participant
        $player = $this->getPlayersService()->getPlayer($playerId);

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardCount($giftId);

        // Contrôle des données
        $this->isValidCreateRewardData($gift, $player, $rewardCount, $user->level);

        // Construction de l'objet
        $reward = new Reward(
            playerId: $player->id,
            giftId: $gift->id,
            points: $gift->value,
            createdBy: $user->id,
        );

        // Insertion
        if (!$this->rewardsRepository->createReward($reward)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }

        // Suppression des points du participant
        $this->getPlayersService()->updatePlayerPoints($playerId, -1 * $gift->value, $user->id);
    }

    /**
     * Suppression logique de l'attribution d'un cadeau
     */
    public function deleteReward(int $rewardId, int $userId): void
    {
        // Contrôle des données
        if (!$rewardId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Récupération de l'attribution du cadeau du participant
        $reward = $this->rewardsRepository->getReward($rewardId);

        if (!$reward) {
            throw new \RuntimeException(MessageHelper::ERR_REWARD_NOT_FOUND);
        }

        // Suppression logique de l'attribution
        if (!$this->rewardsRepository->deleteReward($rewardId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }

        // Récupération des points pour le participant
        $this->getPlayersService()->updatePlayerPoints($reward->playerId, $reward->points, $userId);
    }

    /**
     * Contrôle de cohérence des données
     */
    private function isValidCreateRewardData(GiftOutputDTO $gift, PlayerOutputDTO $player, int $rewardCount, int $level): void
    {
        // Quantité restante positive
        if ($gift->quantity - $rewardCount <= 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_QUANTITY);
        }

        // Points participant suffisants
        if ($player->points < $gift->value) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_GIFT_POINTS);
        }

        // Edition terminée (sauf SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value) {
            $endDate = $this->getEditionsService()->getEditionEndDateByType($gift->id, 'gifts');

            if ($endDate === null || new \DateTimeImmutable() > $endDate) {
                throw new \RuntimeException(MessageHelper::ERR_EDITION_FINISHED);
            }
        }
    }
}
