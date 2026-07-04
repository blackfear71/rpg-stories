<?php
// Imports
require_once 'models/entities/Edition.php';

class EditionsRepository
{
    protected PDO $db;

    protected string $editionsTable = 'editions';
    protected string $giftsTable = 'gifts';
    protected string $playersTable = 'players';

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
    public function getAllEditions(): array
    {
        $sql = "SELECT e.id, e.location, e.start_date, COUNT(p.id) AS 'playerCount'
            FROM {$this->editionsTable} AS e
            LEFT JOIN {$this->playersTable} AS p ON p.edition_id = e.id AND p.is_active = 1
            WHERE e.is_active = 1
            GROUP BY e.id
            ORDER BY e.id ASC";

        $stmt = $this->db->query($sql);

        return array_map(fn($row) => new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date']),
            playerCount: (int) $row['playerCount']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getEdition(int $editionId): ?Edition
    {
        $sql = "SELECT id, location, start_date, end_date, picture, theme, challenge
            FROM {$this->editionsTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $editionId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date']),
            endDate: new \DateTimeImmutable($row['end_date']),
            picture: $row['picture'],
            theme: $row['theme'],
            challenge: $row['challenge']
        );
    }

    /**
     * Lecture de la date de fin d'un enregistrement par Id (éditions)
     */
    public function getEditionEndDateByEditionId(int $editionId): ?\DateTimeImmutable
    {
        $sql = "SELECT end_date
            FROM {$this->editionsTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $editionId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new \DateTimeImmutable($row['end_date']);
    }

    /**
     * Lecture de la date de fin d'un enregistrement avec jointure par Id (cadeaux)
     */
    public function getEditionEndDateByGiftId(int $giftId): ?\DateTimeImmutable
    {
        $sql = "SELECT e.end_date
            FROM {$this->editionsTable} AS e
            INNER JOIN {$this->giftsTable} AS g ON g.edition_id = e.id AND g.is_active = 1
            WHERE g.id = :id AND e.is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $giftId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new \DateTimeImmutable($row['end_date']);
    }

    /**
     * Lecture de la date de fin d'un enregistrement avec jointure par Id (participants)
     */
    public function getEditionEndDateByPlayerId(int $playerId): ?\DateTimeImmutable
    {
        $sql = "SELECT e.end_date
            FROM {$this->editionsTable} AS e
            INNER JOIN {$this->playersTable} AS p ON p.edition_id = e.id AND p.is_active = 1
            WHERE p.id = :id AND e.is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $playerId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new \DateTimeImmutable($row['end_date']);
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): array
    {
        $sql = "SELECT id, location, start_date
            FROM {$this->editionsTable}
            WHERE (CAST(start_date AS CHAR) LIKE :search OR location LIKE :search) AND is_active = 1
            ORDER BY id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'search' => "%$search%"
        ]);

        return array_map(fn($row) => new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date'])
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getEditionPicture(int $editionId): ?string
    {
        $sql = "SELECT picture
            FROM {$this->editionsTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $editionId
        ]);

        $result = $stmt->fetchColumn();

        return $result === false ? null : $result;
    }

    /**
     * Insertion d'une édition
     */
    public function createEdition(Edition $edition): bool
    {
        $sql = "INSERT INTO {$this->editionsTable} (location, start_date, end_date, picture, theme, challenge, created_at, created_by, is_active)
            VALUES (:location, :start_date, :end_date, :picture, :theme, :challenge, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'location'   => $edition->location,
            'start_date' => $edition->startDate->format('Y-m-d H:i:s'),
            'end_date'   => $edition->endDate->format('Y-m-d H:i:s'),
            'picture'    => $edition->picture,
            'theme'      => $edition->theme,
            'challenge'  => $edition->challenge,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $edition->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'une édition
     */
    public function updateEdition(Edition $edition): bool
    {
        $sql = "UPDATE {$this->editionsTable}
            SET location = :location, start_date = :start_date, end_date = :end_date, picture = :picture, theme = :theme, challenge = :challenge, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $edition->id,
            'location'   => $edition->location,
            'start_date' => $edition->startDate->format('Y-m-d H:i:s'),
            'end_date'   => $edition->endDate->format('Y-m-d H:i:s'),
            'picture'    => $edition->picture,
            'theme'      => $edition->theme,
            'challenge'  => $edition->challenge,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $edition->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(int $editionId, int $userId): bool
    {
        $sql = "UPDATE {$this->editionsTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $editionId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
