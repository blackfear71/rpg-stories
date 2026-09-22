<?php

/**
 * Saisie d'un personnage (DTO)
 */
class CharacterInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $campaignId    = 0,
        public readonly string  $name          = '',
        public readonly ?string $picture       = null,
        public readonly ?string $pictureAction = null
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            campaignId: (int) ($data['campaignId'] ?? 0),
            name: $data['name'] ?? '',
            picture: $data['picture'] ?? null,
            pictureAction: $data['pictureAction'] ?? null
        );
    }
}
