<?php
// Imports
require_once 'models/dtos/CampaignOutputDTO.php';

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
    public function getCampaigns(): array
    {
        // Lecture des campagnes
        $campaigns = $this->campaignsRepository->getCampaigns();

        return array_map(fn($campaign) => new CampaignOutputDTO(
            id: $campaign->id,
            name: $campaign->name,
            universe: $campaign->universe,
            players: $campaign->players,
            picture: $campaign->picture
        ), $campaigns);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getCampaign(int $campaignId): CampaignOutputDTO
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture de la campagne
        $dataCampaign = $this->campaignsRepository->getCampaign($campaignId);

        if (!$dataCampaign) {
            throw new \RuntimeException(MessageHelper::ERR_CAMPAIGN_NOT_FOUND);
        }

        // Vérification image existante et génération URL
        $picture = $dataCampaign->picture ? FileHelper::checkFile('images', $dataCampaign->picture) : null;

        // Récupération des données campagne
        return new CampaignOutputDTO(
            id: $dataCampaign->id,
            name: $dataCampaign->name,
            universe: $dataCampaign->universe,
            players: $dataCampaign->players,
            picture: $picture
        );
    }

    /**
     * Lecture des campagnes recherchées
     */
    public function getSearchCampaigns(string $search): array
    {
        // Retour vide si pas de recherche saisie
        if (empty($search)) {
            return [];
        }

        // Recherche des campagnes
        $campaigns = $this->campaignsRepository->getSearchCampaigns(trim($search));

        return array_map(fn($campaign) => new CampaignOutputDTO(
            id: $campaign->id,
            name: $campaign->name,
            universe: $campaign->universe,
            players: $campaign->players,
            picture: $campaign->picture
        ), $campaigns);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createCampaign(CampaignInputDTO $data, ?array $file, int $userId): void
    {
        // Contrôle des données
        $this->isValidCampaignData($data);

        // Traitement de l'image
        $picture = $this->uploadImage(null, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $campaign = new Campaign(
            name: trim($data->name),
            universe: trim($data->universe),
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
        $picture = $this->uploadImage($campaignId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $campaign = new Campaign(
            id: $campaignId,
            name: trim($data->name),
            universe: trim($data->universe),
            players: $data->players,
            picture: $picture,
            updatedBy: $userId
        );

        // Modification
        if (!$this->campaignsRepository->updateCampaign($campaign)) {
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
    private function uploadImage(?int $campaignId, ?string $action, ?array $file): ?string
    {
        // Récupération de l'image de la campagne
        $picture = $campaignId ? $this->campaignsRepository->getCampaignPicture($campaignId) : null;

        // Traitement de l'image
        switch ($action) {
            case EnumAction::CREATE->value:
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage('images', $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return $fileName;
            case EnumAction::DELETE->value:
                // Suppression de l'ancienne image (hors création)
                if ($picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return null;
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }
}
