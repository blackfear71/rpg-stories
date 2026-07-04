<?php
// Imports
require_once 'models/dtos/UserInputDTO.php';

require_once 'services/UsersService.php';

class UsersController
{
    private const controllerName = 'UsersController';

    private PDO $db;
    private UsersService $usersService;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->usersService = new UsersService($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth(?string $token, bool $initLoad = false): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Succès
            ResponseHelper::success($user);
        } catch (Exception $e) {
            // Exception
            if ($initLoad) {
                // On ne remonte pas d'erreur si pas connecté au lancement de l'application
                ResponseHelper::success();
            } else {
                // Échec de l'authentification
                ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$initLoad]);
            }
        }
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->usersService->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Lecture de tous les enregistrements
            $users = $this->usersService->getAllUsers();

            // Succès
            ResponseHelper::success($users);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect(array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Connexion utilisateur
            $user = $this->usersService->connect($dataDTO);

            // Token de connexion
            setcookie(
                'token',
                $user->token,
                [
                    'expires' => time() + 3600 * 24, // 1 jour (identique à la durée stockée en base)
                    'path' => '/',
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]
            );

            // Succès
            ResponseHelper::success($user, MessageHelper::MSG_LOGIN_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$data['login']]);
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Déconnexion utilisateur
            $this->usersService->disconnect($user->id);

            // Suppression token de connexion
            setcookie(
                'token',
                '',
                [
                    'expires' => time() - 3600,
                    'path' => '/',
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]
            );

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_LOGOUT_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(?string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Insertion d'un enregistrement
            $this->usersService->createUser($dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (WarningException $e) {
            // Alerte
            ResponseHelper::warning($e->getMessage(), self::controllerName, __FUNCTION__, [$data['login'], $data['level']]);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$data['login'], $data['level']]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword(?string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->usersService->updatePassword($user->id, $dataDTO);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword(?string $token, int $userId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Modification d'un enregistrement
            $newPassword = $this->usersService->resetPassword($userId, $user->id);

            // Succès
            ResponseHelper::info($newPassword, MessageHelper::MSG_RESET_PASSWORD_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$userId]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser(?string $token, int $userId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Modification d'un enregistrement
            $this->usersService->updateUser($userId, $dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (WarningException $e) {
            // Alerte
            ResponseHelper::warning($e->getMessage(), self::controllerName, __FUNCTION__, [$userId, json_encode($data)]);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$userId, json_encode($data)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteUser(?string $token, int $userId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->usersService->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->usersService->deleteUser($userId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (WarningException $e) {
            // Alerte
            ResponseHelper::warning($e->getMessage(), self::controllerName, __FUNCTION__, [$userId]);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$userId]);
        }
    }
}
