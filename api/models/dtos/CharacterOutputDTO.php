<?php

/**
 * Représente un personnage (DTO)
 */
class CharacterOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $id      = 0,
        public readonly string  $name    = '',
        public readonly ?string $picture = null
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->name,
            'picture' => $this->picture
        ];
    }
}
