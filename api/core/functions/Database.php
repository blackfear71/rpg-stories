<?php
class Database
{
    private static ?array $env = null;

    public ?PDO $conn;

    /**
     * Connexion à la base de données
     */
    public function getConnection(): PDO
    {
        $this->conn = null;

        // Récupération du fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        $sql = [
            'host'     => self::$env['DB_HOST'] ?? 'localhost',
            'port'     => self::$env['DB_PORT'] ?? '',
            'database' => self::$env['DB_NAME'] ?? 'rpg_stories_db',
            'username' => self::$env['DB_USER'] ?? 'root',
            'password' => self::$env['DB_PASS'] ?? '',
        ];

        $this->conn = new PDO(
            "mysql:host=" . $sql['host'] . ";port=" . $sql['port'] . ";dbname=" . $sql['database'] . ";charset=utf8mb4",
            $sql['username'],
            $sql['password']
        );

        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $this->conn;
    }
}
