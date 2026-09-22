<?php
// Imports
require_once 'models/entities/Character.php';

class CharactersRepository
{
    protected PDO $db;

    protected string $charactersTable = 'characters';
    protected string $campaignsTable = 'campaigns';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getCharacter(int $campaignId, int $userId): ?Character
    {
        $sql = "SELECT currentCharacter.id, currentCharacter.name, currentCharacter.picture
            FROM {$this->charactersTable} AS currentCharacter
            INNER JOIN {$this->campaignsTable} AS currentCampaign ON currentCampaign.character_id = currentCharacter.id AND currentCharacter.is_active = 1
            WHERE currentCampaign.id = :id
              AND currentCampaign.created_by = :created_by
              AND currentCampaign.is_active = 1
              AND currentCharacter.created_by = :created_by";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $campaignId,
            'created_by' => $userId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Character(
            id: (int) $row['id'],
            name: $row['name'],
            picture: $row['picture']
        );
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getCharacterPicture(int $characterId, int $userId): ?string
    {
        $sql = "SELECT picture
            FROM {$this->charactersTable}
            WHERE id = :id AND created_by = :created_by AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $characterId,
            'created_by' => $userId
        ]);

        $result = $stmt->fetchColumn();

        return $result === false ? null : $result;
    }

    /**
     * Insertion d'un personnage
     */
    public function createCharacter(Character $character): bool
    {
        $sql = "INSERT INTO {$this->charactersTable} (name, picture, created_at, created_by, is_active)
            VALUES (:name, :picture, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'name'       => $character->name,
            'picture'    => $character->picture,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $character->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'un personnage
     */
    public function updateCharacter(Character $character): bool
    {
        $sql = "UPDATE {$this->charactersTable}
            SET name = :name, picture = :picture, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $character->id,
            'name'       => $character->name,
            'picture'    => $character->picture,
            'created_by' => $character->createdBy,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $character->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCharacter(int $characterId, int $userId): bool
    {
        $sql = "UPDATE {$this->charactersTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $characterId,
            'created_by' => $userId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression logique des enregistrements d'un utilisateur
     */
    public function deleteCharactersByUserId(int $userDeleteId, int $userId): bool
    {
        $sql = "UPDATE {$this->charactersTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE created_by = :created_by AND is_active = 1";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'created_by' => $userDeleteId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
