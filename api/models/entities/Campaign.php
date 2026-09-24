<?php

/**
 * Représente une campagne en base
 */
class Campaign
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id          = 0,
        public readonly ?int                $sagaId      = null,
        public readonly ?int                $characterId = null,
        public readonly string              $name        = '',
        public readonly ?string             $universe    = null,
        public readonly int                 $players     = 0,
        public readonly ?string             $picture     = null,
        public readonly \DateTimeImmutable  $createdAt   = new DateTimeImmutable(),
        public readonly int                 $createdBy   = 0,
        public readonly ?\DateTimeImmutable $updatedAt   = null,
        public readonly ?int                $updatedBy   = null,
        public readonly ?\DateTimeImmutable $deletedAt   = null,
        public readonly ?int                $deletedBy   = null,
        public readonly bool                $isActive    = true
    ) {}
}
