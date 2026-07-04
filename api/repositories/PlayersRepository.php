<?php
// Imports
require_once 'models/entities/Player.php';

class PlayersRepository
{
    protected PDO $db;

    protected string $playersTable = 'players';

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
    public function getEditionPlayers(int $editionId): array
    {
        $sql = "SELECT id, name, points
            FROM {$this->playersTable}
            WHERE edition_id = :edition_id AND is_active = 1
            ORDER BY name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'edition_id' => $editionId
        ]);

        return array_map(fn($row) => new Player(
            id: (int) $row['id'],
            name: $row['name'],
            points: (int) $row['points']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getPlayer(int $playerId): ?Player
    {
        $sql = "SELECT id, name, points
            FROM {$this->playersTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $playerId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Player(
            id: (int) $row['id'],
            name: $row['name'],
            points: (int) $row['points']
        );
    }

    /**
     * Insertion d'un joueur
     */
    public function createPlayer(Player $player): bool
    {
        $sql = "INSERT INTO {$this->playersTable} (edition_id, name, points, created_at, created_by, is_active)
            VALUES (:edition_id, :name, :points, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'edition_id' => $player->editionId,
            'name'       => $player->name,
            'points'     => $player->points,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $player->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'un joueur par Id
     */
    public function updatePlayer(Player $player): bool
    {
        $sql = "UPDATE {$this->playersTable} 
            SET name = :name, points = points + :delta, updated_at = :updated_at, updated_by = :updated_by 
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $player->id,
            'name'       => $player->name,
            'delta'      => $player->points,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $player->updatedBy
        ]);
    }

    /**
     * Modification d'un joueur par Id
     */
    public function updatePlayerPoints(Player $player): bool
    {
        $sql = "UPDATE {$this->playersTable}
            SET points = points + :delta, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $player->id,
            'delta'      => $player->points,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $player->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer(int $playerId, int $userId): bool
    {
        $sql = "UPDATE {$this->playersTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $playerId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int $editionId, int $userId): bool
    {
        $sql = "UPDATE {$this->playersTable} 
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
