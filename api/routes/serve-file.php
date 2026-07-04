<?php

/**
 * Renvoie le fichier demandé
 */
$router->get('/serve-file/:destination', function ($params): void {
    $destination = basename(urldecode($params['destination']));
    $fileName = isset($_GET['file']) ? basename(urldecode($_GET['file'])) : null;

    try {
        // Récupération du fichier
        FileHelper::serveFile($destination, $fileName);
    } catch (Exception $e) {
        // Exception
        ResponseHelper::error($e->getMessage(), 'serve-file', 'serveFile', [$destination, $fileName]);
    }
});
