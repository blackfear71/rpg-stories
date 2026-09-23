<?php

/**
 * Import d'un personnage (DTO)
 */
class ImportCharacterInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int $campaignId  = 0,
        public readonly int $characterId = 0
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            campaignId: (int) ($data['campaignId'] ?? 0),
            characterId: (int) ($data['characterId'] ?? 0)
        );
    }
}
