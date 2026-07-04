<?php
/**
 * Saisie d'un cadeau (DTO)
 */
class GiftInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string $name     = '',
        public readonly int    $value    = 0,
        public readonly int    $quantity = 0
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            value: (int) ($data['value'] ?? 0),
            quantity: (int) ($data['quantity'] ?? 0)
        );
    }
}
