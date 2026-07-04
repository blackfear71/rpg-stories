<?php
/**
 * Saisie d'une édition (DTO)
 */
class EditionInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string  $location      = '',
        public readonly string  $startDate     = '',
        public readonly string  $startTime     = '',
        public readonly string  $endTime       = '',
        public readonly ?string $pictureAction = null,
        public readonly ?string $picture       = null,
        public readonly ?string $theme         = null,
        public readonly ?string $challenge     = null
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            location: $data['location'] ?? '',
            startDate: $data['startDate'] ?? '',
            startTime: $data['startTime'] ?? '',
            endTime: $data['endTime'] ?? '',
            pictureAction: $data['pictureAction'] ?? null,
            picture: $data['picture'] ?? null,
            theme: $data['theme'] ?? null,
            challenge: $data['challenge'] ?? null
        );
    }
}
