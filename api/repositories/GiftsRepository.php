<?php
// Imports
require_once 'models/entities/Gift.php';

class GiftsRepository
{
    protected PDO $db;

    protected string $giftsTable = 'gifts';
    protected string $rewardsTable = 'rewards';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts(int $editionId): array
    {
        $sql = "SELECT g.id, g.edition_id, g.name, g.value, g.quantity, COUNT(r.id) AS reward_count
            FROM {$this->giftsTable} AS g
            LEFT JOIN {$this->rewardsTable} AS r ON r.gift_id = g.id AND r.is_active = 1
            WHERE g.edition_id = :edition_id AND g.is_active = 1
            GROUP BY g.id, g.name, g.value, g.quantity
            ORDER BY g.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'edition_id' => $editionId
        ]);

        return array_map(fn($row) => new Gift(
            id: (int) $row['id'],
            editionId: (int) $row['edition_id'],
            name: $row['name'],
            value: (int) $row['value'],
            quantity: (int) $row['quantity'],
            rewardCount: (int) $row['reward_count']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getGift(int $giftId): ?Gift
    {
        $sql = "SELECT id, value, quantity
            FROM {$this->giftsTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $giftId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Gift(
            id: (int) $row['id'],
            value: (int) $row['value'],
            quantity: (int) $row['quantity']
        );
    }

    /**
     * Insertion d'un cadeau
     */
    public function createGift(Gift $gift): bool
    {
        $sql = "INSERT INTO {$this->giftsTable} (edition_id, name, value, quantity, created_at, created_by, is_active)
            VALUES (:edition_id, :name, :value, :quantity, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'edition_id' => $gift->editionId,
            'name'       => $gift->name,
            'value'      => $gift->value,
            'quantity'   => $gift->quantity,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $gift->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'un cadeau par Id
     */
    public function updateGift(Gift $gift): bool
    {
        $sql = "UPDATE {$this->giftsTable} 
            SET name = :name, value = :value, quantity = :quantity, updated_at = :updated_at, updated_by = :updated_by 
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $gift->id,
            'name'       => $gift->name,
            'value'      => $gift->value,
            'quantity'   => $gift->quantity,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $gift->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteGift(int $giftId, int $userId): bool
    {
        $sql = "UPDATE {$this->giftsTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $giftId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int $editionId, int $userId): bool
    {
        $sql = "UPDATE {$this->giftsTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE edition_id = :edition_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'edition_id' => $editionId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
