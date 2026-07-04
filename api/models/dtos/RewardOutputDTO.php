<?php
/**
 * Représente une récompense (DTO)
 */
class RewardOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int    $id       = 0,
        public readonly int    $giftId   = 0,
        public readonly string $giftName = ''
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'       => $this->id,
            'giftId'   => $this->giftId,
            'giftName' => $this->giftName
        ];
    }
}
