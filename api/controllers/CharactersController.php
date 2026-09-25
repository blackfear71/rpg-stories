<?php
// Imports
require_once 'models/dtos/CharacterInputDTO.php';
require_once 'models/dtos/ImportCharacterInputDTO.php';

require_once 'services/CharactersService.php';
require_once 'services/UsersService.php';

class CharactersController
{
    private const controllerName = 'CharactersController';

    private PDO $db;
    private CharactersService $charactersService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->charactersService = new CharactersService($db);
    }

    /**
     * Instancie le UsersService si besoin
     */
    private function getUsersService(): UsersService
    {
        if ($this->usersService === null) {
            $this->usersService = new UsersService($this->db);
        }

        return $this->usersService;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getCharacters(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture de tous les enregistrements
            $characters = $this->charactersService->getCharacters($user->id);

            // Succès
            // TODO : prévoir le warning image ici
            ResponseHelper::success($characters);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getCharacter(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture d'un enregistrement
            [$character, $pictureError] = $this->charactersService->getCharacter($campaignId, $user->id);

            // Succès
            if (!$pictureError) {
                ResponseHelper::success($character);
            } else {
                ResponseHelper::warning(MessageHelper::WRN_PICTURE_NOT_FOUND, self::controllerName, __FUNCTION__, [$campaignId], $character);
            }
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCharacter(?string $token, int $campaignId, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = CharacterInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Insertion d'un enregistrement
            $this->charactersService->createCharacter($campaignId, $dataDTO, $file, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [json_encode($data), json_encode($file)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateCharacter(?string $token, int $characterId, array $data, array $file): void
    {
        try {
            // Conversion DTO
            $dataDTO = CharacterInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->charactersService->updateCharacter($characterId, $dataDTO, $file, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$characterId, json_encode($data), json_encode($file)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function importCharacter(?string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = ImportCharacterInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->charactersService->importCharacter($dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [json_encode($data)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function detachCharacter(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->charactersService->detachCharacter($campaignId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCharacter(?string $token, int $characterId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Suppression logique d'un enregistrement
            $this->charactersService->deleteCharacter($characterId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$characterId]);
        }
    }
}
