<?php

/**
 * Représente une histoire (DTO)
 */
class StoryOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int                $id         = 0,
        public readonly int                $campaignId = 0,
        public readonly string             $story      = '',
        public readonly \DateTimeImmutable $createdAt  = new DateTimeImmutable()
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'         => $this->id,
            'campaignId' => $this->campaignId,
            'story'      => $this->story,
            'createdAt'  => $this->createdAt->format('c')
        ];
    }
}
