<?php

/**
 * Représente une campagne (DTO)
 */
class CampaignOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $id       = 0,
        public readonly ?int    $sagaId   = null,
        public readonly string  $name     = '',
        public readonly ?string $universe = null,
        public readonly int     $players  = 0,
        public readonly ?string $picture  = null
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'       => $this->id,
            'sagaId'   => $this->sagaId,
            'name'     => $this->name,
            'universe' => $this->universe,
            'players'  => $this->players,
            'picture'  => $this->picture
        ];
    }
}
