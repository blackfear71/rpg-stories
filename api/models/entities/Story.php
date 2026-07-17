<?php

/**
 * Représente un story en base
 */
class Story
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id         = 0,
        public readonly int                 $campaignId = 0,
        public readonly string              $story      = '',
        public readonly \DateTimeImmutable  $createdAt  = new \DateTimeImmutable(),
        public readonly int                 $createdBy  = 0,
        public readonly ?\DateTimeImmutable $updatedAt  = null,
        public readonly ?int                $updatedBy  = null,
        public readonly ?\DateTimeImmutable $deletedAt  = null,
        public readonly ?int                $deletedBy  = null,
        public readonly bool                $isActive   = true
    ) {}
}
