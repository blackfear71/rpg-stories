<?php
/**
 * Enveloppe de réponse API (DTO)
 */
class ApiResponseDTO implements \JsonSerializable
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly string $status  = '',
        public readonly mixed  $data    = null,
        public readonly string $message = '',
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'status'  => $this->status,
            'message' => $this->message,
            'data'    => $this->data,
        ];
    }
}
