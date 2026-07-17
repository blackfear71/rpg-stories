<?php

/**
 * Représente un utilisateur (DTO)
 */
class UserOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $id    = 0,
        public readonly string  $login = '',
        public readonly ?string $token = null,
        public readonly int     $level = 0
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'    => $this->id,
            'login' => $this->login,
            'level' => $this->level
        ];
    }
}
