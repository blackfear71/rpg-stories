<?php
// Imports
require_once 'models/entities/User.php';

class UsersRepository
{
    protected PDO $db;

    protected string $usersTable = 'users';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Contrôle authentification
     */
    public function getUserFromToken(string $token): ?User
    {
        $sql = "SELECT id, login, level
            FROM {$this->usersTable}
            WHERE token = :token AND token IS NOT NULL AND token_expires_at > NOW() AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'token' => $token
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            level: (int) $row['level']
        );
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        $sql = "SELECT id, login, level
            FROM {$this->usersTable}
            WHERE is_active = 1
            ORDER BY login ASC";

        $stmt = $this->db->query($sql);

        return array_map(fn($row) => new User(
            id: (int) $row['id'],
            login: $row['login'],
            level: (int) $row['level']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Récupération données utilisateur actif (via login)
     */
    public function getActiveUserDataByLogin(string $login): ?User
    {
        $sql = "SELECT id, login, password, level
            FROM {$this->usersTable}
            WHERE login = :login AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'login' => $login
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            password: $row['password'],
            level: (int) $row['level']
        );
    }

    /**
     * Récupération données utilisateur actif (via id)
     */
    public function getActiveUserDataById(int $userId): ?User
    {
        $sql = "SELECT id, login, password, level
            FROM {$this->usersTable}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $userId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            password: $row['password'],
            level: (int) $row['level']
        );
    }

    /**
     * Vérifie si le login existe déjà
     */
    public function checkLoginAvailable(string $login): bool
    {
        $sql = "SELECT COUNT(id)
            FROM {$this->usersTable}
            WHERE login = :login";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'login' => $login
        ]);

        return (int) $stmt->fetchColumn() === 0;
    }

    /**
     * Vérifie si l'utilisateur est le dernier super admin actif
     */
    public function isLastAdmin(): bool
    {
        $sql = "SELECT COUNT(id)
            FROM {$this->usersTable}
            WHERE level = :level AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['level' => EnumUserRole::SUPERADMIN->value]);

        return (int) $stmt->fetchColumn() === 1;
    }

    /**
     * Insertion d'un utilisateur
     */
    public function createUser(User $user): bool
    {
        $sql = "INSERT INTO {$this->usersTable} (login, password, level, created_at, created_by, is_active)
            VALUES (:login, :password, :level, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'login'      => $user->login,
            'password'   => $user->password,
            'level'      => $user->level,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $user->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Mise à jour token de connexion
     */
    public function updateToken(int $userId, ?string $token): bool
    {
        $sql = "UPDATE {$this->usersTable}
            SET token = :token, token_expires_at = :token_expires_at, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'               => $userId,
            'token'            => $token,
            'token_expires_at' => $token ? (new DateTime('+1 day'))->format('Y-m-d H:i:s') : NULL,
            'updated_at'       => date('Y-m-d H:i:s'),
            'updated_by'       => $userId
        ]);
    }

    /**
     * Mise à jour mot de passe
     */
    public function updatePassword(int $userResetId, string $hash, int $userId): bool
    {
        $sql = "UPDATE {$this->usersTable}
            SET password = :password, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $userResetId,
            'password'   => $hash,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $userId
        ]);
    }

    /**
     * Mise à jour utilisateur
     */
    public function updateUser(User $user): bool
    {
        $sql = "UPDATE {$this->usersTable}
            SET level = :level, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $user->id,
            'level'      => $user->level,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $user->updatedBy
        ]);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteUser(int $userDeleteId, int $userId): bool
    {
        $sql = "UPDATE {$this->usersTable}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $userDeleteId,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
            'is_active'  => 0
        ]);
    }
}
