<?php
// Imports
require_once 'models/dtos/CharacterInputDTO.php';

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
     * Lecture d'un enregistrement
     */
    public function getCharacter(?string $token, int $campaignId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Lecture d'un enregistrement
            $character = $this->charactersService->getCharacter($campaignId, $user->id);

            // Succès
            ResponseHelper::success($character);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$campaignId]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCharacter(?string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = CharacterInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Insertion d'un enregistrement
            $this->charactersService->createCharacter($dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [json_encode($data)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateCharacter(?string $token, int $characterId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = CharacterInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);

            // Modification d'un enregistrement
            $this->charactersService->updateCharacter($characterId, $dataDTO, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$characterId, json_encode($data)]);
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
