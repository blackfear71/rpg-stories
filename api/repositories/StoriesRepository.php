<?php
// Imports
require_once 'models/entities/Story.php';

class StoriesRepository
{
    protected PDO $db;

    protected string $storiesTable = 'stories';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture des enregistrements d'une campagne
     */
    public function getCampaignStories(int $campaignId): array
    {
        $sql = "SELECT id, campaign_id, story, created_at
            FROM {$this->storiesTable}
            WHERE campaign_id = :campaign_id AND is_active = 1
            ORDER BY id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'campaign_id' => $campaignId
        ]);

        return array_map(fn($row) => new Story(
            id: (int) $row['id'],
            campaignId: (int) $row['campaign_id'],
            story: $row['story'],
            createdAt: new \DateTimeImmutable($row['created_at'])
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    // TODO : utile ?
    public function getStory(int $storyId): ?Story
    {
        $sql = "SELECT id, story, created_at
            FROM {$this->storiesTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $storyId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Story(
            id: (int) $row['id'],
            story: $row['story'],
            createdAt: new \DateTimeImmutable($row['created_at'])
        );
    }

    /**
     * Insertion d'une histoire
     */
    public function createStory(Story $story): bool
    {
        $sql = "INSERT INTO {$this->storiesTable} (campaign_id, story, created_at, created_by, is_active)
            VALUES (:campaign_id, :story, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'campaign_id' => $story->campaignId,
            'story'       => $story->story,
            'created_at'  => date('Y-m-d H:i:s'),
            'created_by'  => $story->createdBy,
            'is_active'   => 1
        ]);
    }

    /**
     * Modification d'une histoire par Id
     */
    public function updateStory(Story $story): bool
    {
        $sql = "UPDATE {$this->storiesTable} 
            SET story = :story, updated_at = :updated_at, updated_by = :updated_by 
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $story->id,
            'story'      => $story->story,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $story->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteStory(int $storyId, int $userId): bool
    {
        $sql = "UPDATE {$this->storiesTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $storyId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression logique des histoires d'une campagne
     */
    public function deleteStories(int $campaignId, int $userId): bool
    {
        $sql = "UPDATE {$this->storiesTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE campaign_id = :campaign_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'campaign_id' => $campaignId,
            'deleted_at'  => date('Y-m-d H:i:s'),
            'deleted_by'  => $userId,
            'is_active'   => 0
        ]);
    }
}
