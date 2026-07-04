<?php
// Imports
require_once 'models/entities/Reward.php';

class RewardsRepository
{
    protected PDO $db;

    protected string $rewardsTable = 'rewards';
    protected string $giftsTable = 'gifts';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture du nombre d'enregistrements
     */
    public function getRewardCount(int $giftId): int
    {
        $sql = "SELECT COUNT(id)
            FROM {$this->rewardsTable}
            WHERE gift_id = :gift_id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['gift_id' => $giftId]);

        return (int) $stmt->fetchColumn();
    }

    /**
     * Lecture des enregistrements d'un participant (y compris les cadeaux supprimés)
     */
    public function getPlayerRewards(int $playerId): array
    {
        $sql = "SELECT r.id, r.gift_id, g.name
            FROM {$this->rewardsTable} AS r
            LEFT JOIN {$this->giftsTable} AS g ON g.id = r.gift_id
            WHERE r.player_id = :player_id AND r.is_active = 1
            ORDER BY r.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'player_id' => $playerId
        ]);

        return array_map(fn($row) => new Reward(
            id: (int) $row['id'],
            giftId: (int) $row['gift_id'],
            giftName: $row['name']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getReward(int $rewardId): ?Reward
    {
        $sql = "SELECT id, player_id, points
            FROM {$this->rewardsTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $rewardId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Reward(
            id: (int) $row['id'],
            playerId: (int) $row['player_id'],
            points: (int) $row['points']
        );
    }

    /**
     * Insertion d'une récompense
     */
    public function createReward(Reward $reward): bool
    {
        $sql = "INSERT INTO {$this->rewardsTable} (player_id, gift_id, points, created_at, created_by, is_active)
            VALUES (:player_id, :gift_id, :points, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'player_id'  => $reward->playerId,
            'gift_id'    => $reward->giftId,
            'points'     => $reward->points,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $reward->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteReward(int $rewardId, int $userId): bool
    {
        $sql = "UPDATE {$this->rewardsTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $rewardId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
