<?php
// Imports
require_once 'models/entities/Campaign.php';

class CampaignsRepository
{
    protected PDO $db;

    protected string $campaignsTable = 'campaigns';
    protected string $storiesTable = 'stories';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getCampaigns(int $userId): array
    {
        $sql = "SELECT id, name, universe, players, picture
            FROM {$this->campaignsTable}
            WHERE created_by = :created_by AND is_active = 1
            ORDER BY id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'created_by' => $userId
        ]);

        return array_map(fn($row) => new Campaign(
            id: (int) $row['id'],
            name: $row['name'],
            universe: $row['universe'],
            players: (int) $row['players'],
            picture: $row['picture']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getCampaign(int $campaignId, int $userId): ?Campaign
    {
        $sql = "SELECT id, name, universe, players, picture
            FROM {$this->campaignsTable}
            WHERE id = :id AND created_by = :created_by AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $campaignId,
            'created_by' => $userId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Campaign(
            id: (int) $row['id'],
            name: $row['name'],
            universe: $row['universe'],
            players: (int) $row['players'],
            picture: $row['picture']
        );
    }

    /**
     * Lecture des campagnes recherchées
     */
    public function getSearchCampaigns(string $search, int $userId): array
    {
        $sql = "SELECT id, name, universe, players
            FROM {$this->campaignsTable}
            WHERE (name LIKE :search OR universe LIKE :search) AND created_by = :created_by AND is_active = 1
            ORDER BY id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'search' => "%$search%",
            'created_by' => $userId
        ]);

        return array_map(fn($row) => new Campaign(
            id: (int) $row['id'],
            name: $row['name'],
            universe: $row['universe'],
            players: (int) $row['players']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getCampaignPicture(int $campaignId, int $userId): ?string
    {
        $sql = "SELECT picture
            FROM {$this->campaignsTable}
            WHERE id = :id AND created_by = :created_by AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $campaignId,
            'created_by' => $userId
        ]);

        $result = $stmt->fetchColumn();

        return $result === false ? null : $result;
    }

    /**
     * Insertion d'une campagne
     */
    public function createCampaign(Campaign $campaign): bool
    {
        $sql = "INSERT INTO {$this->campaignsTable} (name, universe, players, picture, created_at, created_by, is_active)
            VALUES (:name, :universe, :players, :picture, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'name'       => $campaign->name,
            'universe'   => $campaign->universe,
            'players'    => $campaign->players,
            'picture'    => $campaign->picture,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $campaign->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'une campagne
     */
    public function updateCampaign(Campaign $campaign): bool
    {
        $sql = "UPDATE {$this->campaignsTable}
            SET name = :name, universe = :universe, players = :players, picture = :picture, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $campaign->id,
            'name'       => $campaign->name,
            'universe'   => $campaign->universe,
            'players'    => $campaign->players,
            'picture'    => $campaign->picture,
            'created_by' => $campaign->createdBy,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $campaign->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCampaign(int $campaignId, int $userId): bool
    {
        $sql = "UPDATE {$this->campaignsTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $campaignId,
            'created_by' => $userId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
