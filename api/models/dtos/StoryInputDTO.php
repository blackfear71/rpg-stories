<?php

/**
 * Saisie d'une histoire (DTO)
 */
class StoryInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string $story = ''
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            story: $data['story'] ?? ''
        );
    }
}
