<?php
// Imports
require_once 'models/dtos/StoryInputDTO.php';
require_once 'models/dtos/StoryOutputDTO.php';

require_once 'services/CampaignsService.php';

require_once 'repositories/StoriesRepository.php';

class StoriesService
{
    private PDO $db;

    private ?CampaignsService $campaignsService = null;

    private StoriesRepository $storiesRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->storiesRepository = new StoriesRepository($db);
    }

    /**
     * Instancie le CampaignsService si besoin
     */
    private function getCampaignsService(): CampaignsService
    {
        if ($this->campaignsService === null) {
            $this->campaignsService = new CampaignsService($this->db);
        }

        return $this->campaignsService;
    }

    /**
     * Lecture des enregistrements d'une campagne
     */
    public function getCampaignStories(int $campaignId): array
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture des histoires
        $stories = $this->storiesRepository->getCampaignStories($campaignId);

        return array_map(fn($story) => new StoryOutputDTO(
            id: $story->id,
            campaignId: $story->campaignId,
            story: $story->story
        ), $stories);
    }

    /**
     * Lecture d'un enregistrement
     */
    // TODO : utile ?
    public function getStory(int $storyId): StoryOutputDTO
    {
        // Contrôle des données
        if (!$storyId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture de l'histoire
        $story = $this->storiesRepository->getStory($storyId);

        if (!$story) {
            throw new \RuntimeException(MessageHelper::ERR_STORY_NOT_FOUND);
        }

        // Récupération des données histoire
        return new StoryOutputDTO(
            id: $story->id,
            story: $story->story
        );
    }

    /**
     * Création d'une histoire
     */
    public function createStory(int $campaignId, StoryInputDTO $data, UserOutputDTO $user): void
    {
        // Contrôle des données
        $this->isValidCreateStoryData($campaignId, $data, $user->level);

        // Construction de l'objet
        $story = new Story(
            campaignId: $campaignId,
            story: trim($data->story),
            createdBy: $user->id
        );

        // Insertion
        if (!$this->storiesRepository->createStory($story)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
        }
    }
                
    /**
     * Modification d'une histoire
     */
    public function updateStory(int $storyId, StoryInputDTO $data, UserOutputDTO $user): void
    {
        // Contrôle des données
        $this->isValidUpdateStoryData($storyId, $data, $user->level);

        // Construction de l'objet
        $story = new Story(
            id: $storyId,
            story: trim($data->story),
            updatedBy: $user->id
        );

        // Modification
        if (!$this->storiesRepository->updateStory($story)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'une histoire
     */
    public function deleteStory(int $storyId, int $userId): void
    {
        // Contrôle des données
        if (!$storyId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique de l'histoire
        if (!$this->storiesRepository->deleteStory($storyId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression logique des histoires d'une campagne
     */
    public function deleteStories(int $campaignId, int $userId): void
    {
        // Contrôle des données
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        if (!$this->storiesRepository->deleteStories($campaignId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création)
     */
    private function isValidCreateStoryData(int $campaignId, StoryInputDTO $data, int $level): void
    {
        // Identifiant campagne renseigné
        if (!$campaignId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Histoire renseignée
        if (trim($data->story) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_STORY);
        }
    }

    /**
     * Contrôle des données saisies (modification)
     */
    private function isValidUpdateStoryData(int $storyId, StoryInputDTO $data, int $level): void
    {
        // Identifiant histoire renseigné
        if (!$storyId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Histoire renseignée
        if (trim($data->story) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_STORY);
        }
    }
}
