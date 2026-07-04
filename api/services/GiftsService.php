<?php
// Imports
require_once 'models/dtos/GiftInputDTO.php';
require_once 'models/dtos/GiftOutputDTO.php';

require_once 'services/EditionsService.php';
require_once 'services/RewardsService.php';

require_once 'repositories/GiftsRepository.php';

class GiftsService
{
    private PDO $db;

    private ?EditionsService $editionsService = null;
    private ?RewardsService $rewardsService = null;

    private GiftsRepository $giftsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->giftsRepository = new GiftsRepository($db);
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
     * Instancie le RewardsService si besoin
     */
    private function getRewardsService(): RewardsService
    {
        if ($this->rewardsService === null) {
            $this->rewardsService = new RewardsService($this->db);
        }

        return $this->rewardsService;
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts(int $editionId): array
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture des cadeaux
        $gifts = $this->giftsRepository->getEditionGifts($editionId);

        return array_map(function ($gift) {
            // Calcul du nombre de cadeaux restants
            $remainingQuantity = $gift->quantity - $gift->rewardCount;

            // Récupération des données cadeaux
            return new GiftOutputDTO(
                id: $gift->id,
                editionId: $gift->editionId,
                name: $gift->name,
                value: $gift->value,
                quantity: $gift->quantity,
                rewardCount: $gift->rewardCount,
                remainingQuantity: $remainingQuantity
            );
        }, $gifts);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getGift(int $giftId): GiftOutputDTO
    {
        // Contrôle des données
        if (!$giftId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture du cadeau
        $gift = $this->giftsRepository->getGift($giftId);

        if (!$gift) {
            throw new \RuntimeException(MessageHelper::ERR_GIFT_NOT_FOUND);
        }

        // Récupération des données cadeau
        return new GiftOutputDTO(
            id: $gift->id,
            value: $gift->value,
            quantity: $gift->quantity
        );
    }

    /**
     * Création d'un cadeau
     */
    public function createGift(int $editionId, GiftInputDTO $data, UserOutputDTO $user): void
    {
        // Contrôle des données
        $this->isValidCreateGiftData($editionId, $data, $user->level);

        // Construction de l'objet
        $gift = new Gift(
            editionId: $editionId,
            name: trim($data->name),
            value: $data->value,
            quantity: $data->quantity,
            createdBy: $user->id,
        );

        // Insertion
        if (!$this->giftsRepository->createGift($gift)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }

    /**
     * Modification d'un cadeau
     */
    public function updateGift(int $giftId, GiftInputDTO $data, UserOutputDTO $user): void
    {
        // Contrôle des données
        $this->isValidUpdateGiftData($giftId, $data, $user->level);

        // Construction de l'objet
        $gift = new Gift(
            id: $giftId,
            name: trim($data->name),
            value: $data->value,
            quantity: $data->quantity,
            updatedBy: $user->id
        );

        // Modification
        if (!$this->giftsRepository->updateGift($gift)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un cadeau
     */
    public function deleteGift(int $giftId, int $userId): void
    {
        // Contrôle des données
        if (!$giftId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique du cadeau
        if (!$this->giftsRepository->deleteGift($giftId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int $editionId, int $userId): void
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        if (!$this->giftsRepository->deleteGifts($editionId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création)
     */
    private function isValidCreateGiftData(int $editionId, GiftInputDTO $data, int $level): void
    {
        // Identifiant édition renseigné
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }

        // Valeur positive
        if ($data->value <= 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_VALUE);
        }

        // Quantité positive
        if ($data->quantity < 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_QUANTITY);
        }

        // Edition terminée (sauf SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value) {
            $endDate = $this->getEditionsService()->getEditionEndDateByType($editionId, 'editions');

            if ($endDate === null || new \DateTimeImmutable() > $endDate) {
                throw new \RuntimeException(MessageHelper::ERR_EDITION_FINISHED);
            }
        }
    }

    /**
     * Contrôle des données saisies (modification)
     */
    private function isValidUpdateGiftData(int $giftId, GiftInputDTO $data, int $level): void
    {
        // Identifiant cadeau renseigné
        if (!$giftId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }

        // Valeur positive
        if ($data->value <= 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_VALUE);
        }

        // Nombre d'attributions du cadeau
        $rewardCount = $this->getRewardsService()->getRewardCount($giftId);

        if ($data->quantity < $rewardCount) {
            throw new \RuntimeException(MessageHelper::ERR_QUANTITY_ATTRIBUTION);
        }

        // Edition terminée (sauf SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value) {
            $endDate = $this->getEditionsService()->getEditionEndDateByType($giftId, 'gifts');

            if ($endDate === null || new \DateTimeImmutable() > $endDate) {
                throw new \RuntimeException(MessageHelper::ERR_EDITION_FINISHED);
            }
        }
    }
}
