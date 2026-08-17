<?php

/**
 * Représente une recherche (DTO)
 */
class SearchOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $campaignId   = 0,
        public readonly string  $campaignName = '',
        public readonly ?int    $sagaId       = null,
        public readonly ?string $sagaName     = '',
        public readonly ?string $universe     = null
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'campaignId'   => $this->campaignId,
            'campaignName' => $this->campaignName,
            'sagaId'       => $this->sagaId,
            'sagaName'     => $this->sagaName,
            'universe'     => $this->universe
        ];
    }
}
