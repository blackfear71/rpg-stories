<?php
// Imports
require_once 'models/dtos/UserOutputDTO.php';

require_once 'repositories/UsersRepository.php';

class UsersService
{
    private PDO $db;

    private UsersRepository $usersRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->usersRepository = new UsersRepository($db);
    }

    /**
     * Contrôle authentification et niveau utilisateur
     */
    public function checkAuthAndLevel(?string $token, int $minimumLevel): UserOutputDTO
    {
        // Contrôle des données
        if (!$token) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_TOKEN);
        }

        // Lecture de l'utilisateur
        $user = $this->usersRepository->getUserFromToken($token);

        if (!$user) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_AUTH);
        }

        // Contrôle du niveau utilisateur
        if ($user->level < $minimumLevel) {
            throw new \RuntimeException(MessageHelper::ERR_UNAUTHORIZED_ACTION);
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            level: $user->level
        );
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        // Lecture des utilisateurs
        $users = $this->usersRepository->getAllUsers();

        // Récupération des données utilisateurs
        return array_map(fn($user) => new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            level: $user->level
        ), $users);
    }

    /**
     * Connexion utilisateur
     */
    public function connect(UserInputDTO $data): UserOutputDTO
    {
        // Contrôle des données
        $this->isValidConnectionData($data);

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->usersRepository->getActiveUserDataByLogin($data->login);

        if (!$user) {
            throw new \RuntimeException(MessageHelper::ERR_USER_NOT_FOUND);
        }

        // Contrôle mot de passe incorrect
        if (!password_verify($data->password, $user->password)) {
            throw new \RuntimeException(MessageHelper::ERR_USER_PASSWORD_INVALID);
        }

        // Stockage du nouveau token de connexion
        $token = bin2hex(random_bytes(32));

        if (!$this->usersRepository->updateToken($user->id, $token)) {
            throw new \RuntimeException(MessageHelper::ERR_LOGIN_FAILED);
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $user->id,
            login: trim($user->login),
            token: trim($token),
            level: $user->level
        );
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect(int $userId): void
    {
        // Contrôle des données
        if (!$userId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Récupération de l'utilisateur
        $user = $this->usersRepository->getActiveUserDataById($userId);

        if (!$user) {
            throw new \RuntimeException(MessageHelper::ERR_USER_NOT_FOUND);
        }

        // Suppression token de connexion
        if (!$this->usersRepository->updateToken($user->id, null)) {
            throw new \RuntimeException(MessageHelper::ERR_LOGOUT_FAILED);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(UserInputDTO $data, int $userId): void
    {
        // Contrôle des données
        $this->isValidCreateUserData($data);

        // Construction de l'objet
        $user = new User(
            login: trim($data->login),
            password: password_hash(trim($data->password), PASSWORD_DEFAULT),
            level: $data->level,
            createdBy: $userId
        );

        // Insertion
        if (!$this->usersRepository->createUser($user)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword(int $userId, UserInputDTO $data): void
    {
        // Contrôle des données
        $this->isValidPasswordData($userId, $data);

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->usersRepository->getActiveUserDataById($userId);

        if (!$user) {
            throw new \RuntimeException(MessageHelper::ERR_USER_NOT_FOUND);
        }

        // Contrôle ancien mot de passe incorrect
        if (!password_verify($data->oldPassword, $user->password)) {
            throw new \RuntimeException(MessageHelper::ERR_USER_PASSWORD_INVALID);
        }

        // Formatage des données mot de passe
        $hash = password_hash($data->password, PASSWORD_DEFAULT);

        // Modification
        if (!$this->usersRepository->updatePassword($user->id, $hash, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_PASSWORD_FAILED);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword(int $userResetId, int $userId): string
    {
        // Contrôle des données
        if (!$userResetId || !$userId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Formatage des données mot de passe
        $newPassword = $this->generatePassword(15);
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);

        // Modification
        if (!$this->usersRepository->updatePassword($userResetId, $hash, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_RESET_PASSWORD_FAILED);
        }

        return $newPassword;
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser(int $userUpdateId, UserInputDTO $data, int $userId): void
    {
        // Contrôle des données
        $this->isValidUpdateUserData($userUpdateId, $data);

        // Récupération de l'utilisateur à modifier pour vérifier si c'est le dernier admin actif
        $currentUser = $this->usersRepository->getActiveUserDataById($userUpdateId);

        if (!$currentUser) {
            throw new \RuntimeException(MessageHelper::ERR_USER_NOT_FOUND);
        }

        // Contrôle dernier admin actif si changement de rôle
        if ($currentUser->level == EnumUserRole::SUPERADMIN->value && $data->level !== EnumUserRole::SUPERADMIN->value && $this->usersRepository->isLastAdmin()) {
            throw new \WarningException(MessageHelper::WRN_LAST_ADMIN);
        }

        // Construction de l'objet
        $user = new User(
            id: $currentUser->id,
            level: $data->level,
            updatedBy: $userId
        );

        // Modification
        if (!$this->usersRepository->updateUser($user)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un utilisateur
     */
    public function deleteUser(int $userDeleteId, int $userId): void
    {
        // Contrôle des données
        $this->isValidDeleteUserData($userDeleteId, $userId);

        // Récupération de l'utilisateur à supprimer pour vérifier si c'est le dernier admin actif
        $user = $this->usersRepository->getActiveUserDataById($userDeleteId);

        if (!$user) {
            throw new \RuntimeException(MessageHelper::ERR_USER_NOT_FOUND);
        }

        // Contrôle dernier admin actif si suppression
        if ($user->level == EnumUserRole::SUPERADMIN->value && $this->usersRepository->isLastAdmin()) {
            throw new \WarningException(MessageHelper::WRN_LAST_ADMIN);
        }

        // Suppression logique de l'utilisateur
        if (!$this->usersRepository->deleteUser($userDeleteId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (connexion)
     */
    private function isValidConnectionData(UserInputDTO $data): void
    {
        // Login renseigné
        if (trim($data->login) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Mot de passe renseigné
        if (trim($data->password) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_PASSWORD);
        }
    }

    /**
     * Contrôle des données saisies (création)
     */
    private function isValidCreateUserData(UserInputDTO $data): void
    {
        $password = trim($data->password);
        $confirmPassword = trim($data->confirmPassword);

        // Login renseigné
        if (trim($data->login) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Login existant
        if (!$this->usersRepository->checkLoginAvailable($data->login)) {
            throw new WarningException(MessageHelper::WRN_USER_EXISTS);
        }

        // Niveau renseigné
        if (!$data->level === null) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_LEVEL);
        }

        // Niveau existant
        if (!in_array($data->level, array_column(EnumUserRole::cases(), 'value'))) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_LEVEL);
        }

        // Mot de passe renseigné
        if ($password === '' || $confirmPassword === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_PASSWORD);
        }

        // Mot de passe correct
        if ($password !== $confirmPassword) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_PASSWORD_MATCH);
        }
    }

    /**
     * Contrôle des données saisies (modification)
     */
    private function isValidUpdateUserData(int $userId, UserInputDTO $data): void
    {
        // Identifiant renseigné
        if (!$userId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Niveau renseigné
        if ($data->level === null) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_LEVEL);
        }

        // Niveau existant
        if (!in_array($data->level, array_column(EnumUserRole::cases(), 'value'))) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_LEVEL);
        }
    }

    /**
     * Contrôle des données saisies (suppression)
     */
    private function isValidDeleteUserData(int $userDeleteId, int $userId): void
    {
        // Identifiant renseigné
        if (!$userDeleteId || !$userId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Identifiant différent
        if ($userDeleteId === $userId) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_ID_MATCH);
        }
    }

    /**
     * Contrôle des données saisies (modification mot de passe)
     */
    private function isValidPasswordData(int $userId, UserInputDTO $data): void
    {
        $oldPassword = trim($data->oldPassword);
        $newPassword = trim($data->password);
        $confirmPassword = trim($data->confirmPassword);

        // Identifiant renseigné
        if (!$userId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Mot de passe renseigné
        if ($oldPassword === '' || $newPassword === '' || $confirmPassword === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_PASSWORD);
        }

        // Mot de passe correct
        if ($oldPassword === $newPassword || $newPassword !== $confirmPassword) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_PASSWORD_MATCH);
        }
    }

    /**
     * Génère un mot de passe aléatoire
     */
    private function generatePassword(int $length = 12): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $charactersLength = strlen($characters);
        $password = '';

        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, $charactersLength - 1)];
        }

        return $password;
    }
}
