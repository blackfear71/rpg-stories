<?php

/**
 * Saisie d'un utilisateur (DTO)
 */
class UserInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly string  $login           = '',
        public readonly ?string $token           = null,
        public readonly ?int    $level           = null,
        public readonly string  $password        = '',
        public readonly string  $oldPassword     = '',
        public readonly string  $confirmPassword = ''
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            login: $data['login'] ?? '',
            token: $data['token'] ?? null,
            level: isset($data['level']) ? (int) $data['level'] : null,
            password: $data['password'] ?? '',
            oldPassword: $data['oldPassword'] ?? '',
            confirmPassword: $data['confirmPassword'] ?? ''
        );
    }
}
