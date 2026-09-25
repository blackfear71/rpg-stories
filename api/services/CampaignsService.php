<?php
// Imports
require_once 'models/dtos/CampaignOutputDTO.php';
require_once 'models/dtos/SearchOutputDTO.php';

require_once 'services/StoriesService.php';

require_once 'repositories/CampaignsRepository.php';

class CampaignsService
{
    private PDO $db;

    private ?StoriesService $storiesService = null;

    private CampaignsRepository $campaignsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->campaignsRepository = new CampaignsRepository($db);
    }

    /**
     * Instancie le StoriesService si besoin
     */
    private function getStoriesService(): StoriesService
    {
        if ($this->storiesService === null) {
            $this->storiesService = new StoriesService($this->db);
        }

        return $this->storiesService;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getCampaigns(int $userId): array
    {
        // Lecture des campagnes
        $campaigns = $this->campaignsRepository->getCampaigns($userId);

        return array_map(fn($campaign) => new CampaignOutputDTO(
            id: $campaign->id,
            sagaId: $campaign->sagaId,
            name: $campaign->name,
            universe: $campaign->universe,
            players: $campaign->players,
            picture: $campaign->picture
        ), $campaigns);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getCampaign(int $campaignId, int $userId): CampaignOutputDTO
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture de la campagne
        $dataCampaign = $this->campaignsRepository->getCampaign($campaignId, $userId);

        if (!$dataCampaign) {
            throw new \RuntimeException(MessageHelper::ERR_CAMPAIGN_NOT_FOUND);
        }

        // Vérification image existante et génération URL
        $picture = $dataCampaign->picture ? FileHelper::checkFile('images/campaigns', $dataCampaign->picture) : null;

        // Récupération des données campagne
        return new CampaignOutputDTO(
            id: $dataCampaign->id,
            sagaId: $dataCampaign->sagaId,
            name: $dataCampaign->name,
            universe: $dataCampaign->universe,
            players: $dataCampaign->players,
            picture: $picture
        );
    }

    /**
     * Lecture des campagnes de la saga liée
     */
    public function getSagaCampaigns(int $campaignId, int $userId): array
    {
        // Lecture des campagnes
        $campaigns = $this->campaignsRepository->getSagaCampaigns($campaignId, $userId);

        return array_map(fn($campaign) => new CampaignOutputDTO(
            id: $campaign->id,
            sagaId: $campaign->sagaId,
            name: $campaign->name,
            universe: $campaign->universe,
            players: $campaign->players,
            picture: $campaign->picture
        ), $campaigns);
    }

    /**
     * Lecture des campagnes recherchées
     */
    public function getSearchCampaigns(string $search, int $userId): array
    {
        // Retour vide si pas de recherche saisie
        if (empty($search)) {
            return [];
        }

        // Recherche des campagnes
        $searchResults = $this->campaignsRepository->getSearchCampaigns(trim($search), $userId);

        return array_map(fn($searchResult) => new SearchOutputDTO(
            campaignId: $searchResult->campaignId,
            campaignName: $searchResult->campaignName,
            sagaId: $searchResult->sagaId,
            sagaName: $searchResult->sagaName,
            universe: $searchResult->universe
        ), $searchResults);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCampaign(CampaignInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        $this->isValidCampaignData($data);

        // Traitement de l'image
        $picture = $this->processImage(null, $userId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $campaign = new Campaign(
            sagaId: $data->sagaId,
            name: trim($data->name),
            universe: $data->universe ? trim($data->universe) : null,
            players: $data->players,
            picture: $picture,
            createdBy: $userId
        );

        // Insertion
        if (!$this->campaignsRepository->createCampaign($campaign)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateCampaign(int $campaignId, CampaignInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        $this->isValidCampaignData($data);

        // Traitement de l'image
        $picture = $this->processImage($campaignId, $userId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $campaign = new Campaign(
            id: $campaignId,
            sagaId: $data->sagaId,
            name: trim($data->name),
            universe: $data->universe ? trim($data->universe) : null,
            players: $data->players,
            picture: $picture,
            createdBy: $userId,
            updatedBy: $userId
        );

        // Modification
        if (!$this->campaignsRepository->updateCampaign($campaign)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Modification de la saga des campagnes liées
     */
    public function updateCampaignsSaga(int $sagaId, int $userId): void
    {
        // Contrôle des données
        if (!$sagaId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Modification
        if (!$this->campaignsRepository->updateCampaignsSaga($sagaId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Modification du personnage de la campagne
     */
    public function updateCampaignCharacter(int $campaignId, ?int $characterId, int $userId): void
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Modification
        if (!$this->campaignsRepository->updateCampaignCharacter($campaignId, $characterId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteCampaign(int $campaignId, int $userId): void
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des histoires
        $this->getStoriesService()->deleteStories($campaignId, $userId);

        // Suppression logique de la campagne
        if (!$this->campaignsRepository->deleteCampaign($campaignId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression du personnage des campagnes liées
     */
    public function deleteCampaignsCharacter(int $characterId, int $userId): void
    {
        // Contrôle des données
        if (!$characterId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Modification
        if (!$this->campaignsRepository->deleteCampaignsCharacter($characterId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression logique des enregistrements d'un utilisateur
     */
    public function deleteCampaignsByUserId(int $userDeleteId, int $userId): void
    {
        // Contrôle des données
        if (!$userDeleteId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des campagnes
        if (!$this->campaignsRepository->deleteCampaignsByUserId($userDeleteId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidCampaignData(CampaignInputDTO $data): void
    {
        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }

        // Nombre de joueurs positif
        if ($data->players <= 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_PLAYERS);
        }
    }

    /**
     * Traitement de l'image
     */
    private function processImage(?int $campaignId, int $userId, ?string $action, ?array $file): ?string
    {
        $destination = 'images/campaigns';

        // Récupération de l'image de la campagne
        $picture = $campaignId ? $this->campaignsRepository->getCampaignPicture($campaignId, $userId) : null;

        // Traitement de l'image
        switch ($action) {
            case EnumAction::CREATE->value:
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage($destination, $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile($destination, $picture);
                }

                return $fileName;
            case EnumAction::DELETE->value:
                // Suppression de l'ancienne image (hors création)
                if ($picture) {
                    FileHelper::deleteFile($destination, $picture);
                }

                return null;
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }
}
