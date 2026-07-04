<?php
/**
 * Représente une récompense en base
 */
class Reward
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id        = 0,
        public readonly int                 $playerId  = 0,
        public readonly int                 $giftId    = 0,
        public readonly int                 $points    = 0,
        public readonly string              $giftName  = '',
        public readonly \DateTimeImmutable  $createdAt = new \DateTimeImmutable(),
        public readonly int                 $createdBy = 0,
        public readonly ?\DateTimeImmutable $updatedAt = null,
        public readonly ?int                $updatedBy = null,
        public readonly ?\DateTimeImmutable $deletedAt = null,
        public readonly ?int                $deletedBy = null,
        public readonly bool                $isActive  = true
    ) {}
}
