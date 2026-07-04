<?php
/**
 * Représente une édition (DTO)
 */
class EditionOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int                $id          = 0,
        public readonly string             $location    = '',
        public readonly \DateTimeImmutable $startDate   = new DateTimeImmutable(),
        public readonly \DateTimeImmutable $endDate     = new DateTimeImmutable(),
        public readonly ?string            $picture     = null,
        public readonly ?string            $theme       = null,
        public readonly ?string            $challenge   = null,
        public readonly array              $gifts       = [],
        public readonly array              $players     = [],
        public readonly int                $playerCount = 0
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'          => $this->id,
            'location'    => $this->location,
            'startDate'   => $this->startDate->format('c'),
            'endDate'     => $this->endDate->format('c'),
            'picture'     => $this->picture,
            'theme'       => $this->theme,
            'challenge'   => $this->challenge,
            'gifts'       => $this->gifts,
            'players'     => $this->players,
            'playerCount' => $this->playerCount
        ];
    }
}
