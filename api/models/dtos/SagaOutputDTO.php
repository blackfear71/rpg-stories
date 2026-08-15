<?php

/**
 * Représente une saga (DTO)
 */
class SagaOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int    $id   = 0,
        public readonly string $name = '',
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name
        ];
    }
}
