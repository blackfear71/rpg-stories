<?php
/**
 * Représente un participant (DTO)
 */
class PlayerOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     * @param RewardOutputDTO[] $rewards
     */
    public function __construct(
        public readonly int    $id      = 0,
        public readonly string $name    = '',
        public readonly int    $points  = 0,
        public readonly array  $rewards = []
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->name,
            'points'  => $this->points,
            'rewards' => $this->rewards
        ];
    }
}
