<?php

/**
 * Représente un résultat de recherche en base
 */
class Search
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int     $campaignId   = 0,
        public readonly string  $campaignName = '',
        public readonly ?int    $sagaId       = null,
        public readonly ?string $sagaName     = null,
        public readonly ?string $universe     = null
    ) {}
}
