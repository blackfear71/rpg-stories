<?php
// Imports
require_once 'models/entities/Saga.php';

class SagasRepository
{
    protected PDO $db;

    protected string $sagasTable = 'sagas';

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
    public function getSagas(int $userId): array
    {
        $sql = "SELECT id, name
            FROM {$this->sagasTable}
            WHERE created_by = :created_by AND is_active = 1
            ORDER BY name ASC, id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'created_by' => $userId
        ]);

        return array_map(fn($row) => new Saga(
            id: (int) $row['id'],
            name: $row['name']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Insertion d'une saga
     */
    public function createSaga(Saga $saga): bool
    {
        $sql = "INSERT INTO {$this->sagasTable} (name, created_at, created_by, is_active)
            VALUES (:name, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'name'       => $saga->name,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $saga->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'une saga
     */
    public function updateSaga(Saga $saga): bool
    {
        $sql = "UPDATE {$this->sagasTable}
            SET name = :name, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $saga->id,
            'name'       => $saga->name,
            'created_by' => $saga->createdBy,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $saga->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteSaga(int $sagaId, int $userId): bool
    {
        $sql = "UPDATE {$this->sagasTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id AND created_by = :created_by";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $sagaId,
            'created_by' => $userId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
