<?php
/**
 * Représente une édition en base
 */
class Edition
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id          = 0,
        public readonly string              $location    = '',
        public readonly \DateTimeImmutable  $startDate   = new DateTimeImmutable(),
        public readonly \DateTimeImmutable  $endDate     = new DateTimeImmutable(),
        public readonly ?string             $picture     = null,
        public readonly ?string             $theme       = null,
        public readonly ?string             $challenge   = null,
        public readonly int                 $playerCount = 0,
        public readonly \DateTimeImmutable  $createdAt   = new DateTimeImmutable(),
        public readonly int                 $createdBy   = 0,
        public readonly ?\DateTimeImmutable $updatedAt   = null,
        public readonly ?int                $updatedBy   = null,
        public readonly ?\DateTimeImmutable $deletedAt   = null,
        public readonly ?int                $deletedBy   = null,
        public readonly bool                $isActive    = true
    ) {}
}
