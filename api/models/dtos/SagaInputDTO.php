<?php

/**
 * Saisie d'une saga (DTO)
 */
class SagaInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string  $name = ''
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? ''
        );
    }
}
