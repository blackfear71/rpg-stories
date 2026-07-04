<?php

/** @var PDO $db */

// Imports
require_once 'controllers/SseController.php';

/**
 * Flux SSE de récupération des participants et cadeaux d'une édition
 */
$router->get('/sse/edition/:editionId', function (array $params) use ($db): void {
    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Appel contrôleur
    (new SseController($db))->getSseEdition($editionId);
});
