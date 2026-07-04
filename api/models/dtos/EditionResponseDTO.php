<?php
/**
 * Représente une édition avec ses donnéees complètes (DTO)
 */
class EditionResponseDTO implements \JsonSerializable
{
    /**
     * Constructeur
     * @param GiftOutputDTO[]   $gifts
     * @param PlayerOutputDTO[] $players
     */
    public function __construct(
        public readonly EditionOutputDTO $edition = new EditionOutputDTO(),
        public readonly array            $gifts   = [],
        public readonly array            $players = []
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'edition' => $this->edition,
            'gifts'   => $this->gifts,
            'players' => $this->players
        ];
    }
}
