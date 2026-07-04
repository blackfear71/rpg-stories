<?php
/**
 * Représente un cadeau (DTO)
 */
class GiftOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int    $id                = 0,
        public readonly int    $editionId         = 0,
        public readonly string $name              = '',
        public readonly int    $value             = 0,
        public readonly int    $quantity          = 0,
        public readonly int    $rewardCount       = 0,
        public readonly int    $remainingQuantity = 0
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'                => $this->id,
            'editionId'         => $this->editionId,
            'name'              => $this->name,
            'value'             => $this->value,
            'quantity'          => $this->quantity,
            'rewardCount'       => $this->rewardCount,
            'remainingQuantity' => $this->remainingQuantity
        ];
    }
}
