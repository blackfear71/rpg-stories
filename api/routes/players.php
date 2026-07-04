<?php

/** @var PDO $db */

// Imports
require_once 'controllers/PlayersController.php';

/**
 * Lecture des enregistrements d'une édition
 */
$router->get('/players/edition/:editionId', function (array $params) use ($db): void {
    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Appel contrôleur
    (new PlayersController($db))->getEditionPlayers($editionId);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/players/create/edition/:editionId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->createPlayer($token, $editionId, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/players/update/:playerId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $playerId = DataHelper::parseIntParam($params['playerId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->updatePlayer($token, $playerId, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/players/delete/:playerId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $playerId = DataHelper::parseIntParam($params['playerId']);

    // Appel contrôleur
    (new PlayersController($db))->deletePlayer($token, $playerId);
});
