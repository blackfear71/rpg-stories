<?php
class FileHelper
{
    private const helperName = 'FileHelper';

    private static $env = null;

    /**
     * Contrôle l'existence d'un fichier sur le serveur
     * @param $destination Dossier de destination
     * @param $fileName Nom du fichier
     */
    public static function checkFile(string $destination, string $fileName): string
    {
        // Contrôle des données
        if (!$destination || !$fileName) {
            throw new \InvalidArgumentException(MessageHelper::ERR_MISSING_PARAMS);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (empty(self::$env['FILES_DIR'])) {
            throw new \RuntimeException(MessageHelper::ERR_ENV_FILES_DIR_MISSING);
        }

        // Construction du chemin vers le fichier et contrôle que le fichier existe
        $destination = trim($destination, '/\\');
        $fileName = basename($fileName);

        $dir = rtrim(self::$env['FILES_DIR'], '/\\');
        $filePath = "$dir/$destination/$fileName";

        $realDir = realpath($dir);
        $realPath = realpath($filePath);

        if (!is_dir($dir) || $realDir === false || !is_file($filePath) || $realPath === false || !str_starts_with($realPath, $realDir)) {
            throw new \RuntimeException(MessageHelper::ERR_FILE_NOT_FOUND);
        }

        return $fileName;
    }

    /**
     * Enregistre un fichier dans le dossier de destination
     * @param $destination Dossier de destination
     * @param $file Fichier
     */
    public static function uploadImage(string $destination, array $file): string
    {
        // Contrôle des données
        if (!$destination || !isset($file)) {
            throw new \InvalidArgumentException(MessageHelper::ERR_MISSING_PARAMS);
        }

        // Contrôle erreur fichier reçu
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_FILE);
        }

        // Contrôle taille du fichier
        $uploadMaxBytes = self::convertToBytes(ini_get('upload_max_filesize'));
        $postMaxBytes = self::convertToBytes(ini_get('post_max_size'));
        $serverMaxSize = min($uploadMaxBytes, $postMaxBytes);
        $fileSize = $file['size'] ?? 0;

        if ($fileSize > $serverMaxSize) {
            throw new \RuntimeException(MessageHelper::ERR_FILE_TOO_LARGE);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (empty(self::$env['FILES_DIR'])) {
            throw new \RuntimeException(MessageHelper::ERR_ENV_FILES_DIR_MISSING);
        }

        // Contrôle que le dossier des fichiers existe sinon il est créé
        $uploadDir = self::$env['FILES_DIR'] . '/' . $destination;

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
            throw new \RuntimeException(MessageHelper::ERR_CREATION_FOLDER_FAILED);
        }

        // Contrôle que le fichier est bien une image
        $fileTmp = $file['tmp_name'];
        $imageInfo = getimagesize($fileTmp);

        if ($imageInfo === false) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_IMAGE);
        }

        // Récupération du type MIME
        $mimeType = $imageInfo['mime'];

        // Construction du chemin vers le fichier
        $newFileName = uniqid('picture-', true) . '.webp';
        $destinationPath = $uploadDir . '/' . $newFileName;

        // Conversion éventuelle en WebP
        switch ($mimeType) {
            case 'image/jpeg':
                // JPEG
                $image = imagecreatefromjpeg($fileTmp);

                if (!$image) {
                    throw new \RuntimeException(MessageHelper::ERR_CREATION_IMAGE_FAILED);
                }
                break;

            case 'image/png':
                // PNG
                $image = imagecreatefrompng($fileTmp);

                if (!$image) {
                    throw new \RuntimeException(MessageHelper::ERR_CREATION_IMAGE_FAILED);
                }

                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
                break;

            case 'image/webp':
                // Si déjà en WebP, copie directe
                if (!move_uploaded_file($fileTmp, $destinationPath)) {
                    throw new \RuntimeException(MessageHelper::ERR_UPLOAD_FAILED);
                }

                return $newFileName;

            default:
                throw new \RuntimeException(MessageHelper::ERR_INVALID_FILE_FORMAT);
        }

        // Compression WebP s'il ne l'était pas déjà
        if (!imagewebp($image, $destinationPath, 100)) {
            throw new \RuntimeException(MessageHelper::ERR_WEBP_CONVERSION_FAILED);
        }

        return $newFileName;
    }

    /**
     * Convertit une taille en bytes (ex : 2M -> 2048)
     */
    private static function convertToBytes(string $value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $num = (int)$value;

        switch ($last) {
            case 'g':
                $num *= 1024 ** 3;
                break;
            case 'm':
                $num *= 1024 ** 2;
                break;
            case 'k':
                $num *= 1024 ** 1;
                break;
        }

        return $num;
    }

    /**
     * Supprime un fichier dans le dossier de destination
     * @param $destination Dossier de destination
     * @param $fileName Nom du fichier
     */
    public static function deleteFile(string $destination, string $fileName): void
    {
        // Contrôle des données
        if (!$destination || !$fileName) {
            throw new \InvalidArgumentException(MessageHelper::ERR_MISSING_PARAMS);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (empty(self::$env['FILES_DIR'])) {
            throw new \RuntimeException(MessageHelper::ERR_ENV_FILES_DIR_MISSING);
        }

        // Construction du chemin vers le fichier et contrôle que le fichier existe
        $destination = trim($destination, '/\\');
        $fileName = basename($fileName);

        $dir = rtrim(self::$env['FILES_DIR'], '/\\');
        $filePath = "$dir/$destination/$fileName";

        $realDir = realpath($dir);
        $realPath = realpath($filePath);

        if (!is_dir($dir) || $realDir === false || !is_file($filePath) || $realPath === false || !str_starts_with($realPath, $realDir)) {
            throw new \RuntimeException(MessageHelper::ERR_FILE_NOT_FOUND);
        }

        // Tentative de suppression
        if (!unlink($filePath)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FILE_FAILED);
        }
    }

    /**
     * Renvoie le fichier demandé
     */
    public static function serveFile(?string $destination, ?string $fileName): void
    {
        // Contrôle des données
        if (!$destination || !$fileName) {
            throw new \InvalidArgumentException(MessageHelper::ERR_MISSING_PARAMS);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (empty(self::$env['FILES_DIR'])) {
            throw new \RuntimeException(MessageHelper::ERR_ENV_FILES_DIR_MISSING);
        }

        // Construction du chemin vers le fichier et contrôle que le fichier existe
        $destination = trim($destination, '/\\');
        $fileName = basename($fileName);

        $dir = rtrim(self::$env['FILES_DIR'], '/\\');
        $filePath = "$dir/$destination/$fileName";

        $realDir = realpath($dir);
        $realPath = realpath($filePath);

        if (!is_dir($dir) || $realDir === false || !is_file($filePath) || $realPath === false || !str_starts_with($realPath, $realDir)) {
            throw new \RuntimeException(MessageHelper::ERR_FILE_NOT_FOUND);
        }

        // Récupération du type MIME
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);

        if ($mimeType === false) {
            throw new \RuntimeException(MessageHelper::ERR_INVALID_FILE_FORMAT);
        }

        // Envoi du fichier
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));

        if (readfile($filePath) === false) {
            throw new \RuntimeException(MessageHelper::ERR_FILE_NOT_FOUND);
        }
    }
}
