<?php

/**
 * Saisie d'une campagne (DTO)
 */
class CampaignInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string  $name          = '',
        public readonly ?int    $sagaId        = null,
        public readonly ?string $universe      = null,
        public readonly int     $players       = 0,
        public readonly ?string $picture       = null,
        public readonly ?string $pictureAction = null
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            sagaId: $data['sagaId'] ?? null,
            universe: $data['universe'] ?? null,
            players: (int) ($data['players'] ?? 0),
            picture: $data['picture'] ?? null,
            pictureAction: $data['pictureAction'] ?? null
        );
    }
}
