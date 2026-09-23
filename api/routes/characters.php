<?php

/** @var PDO $db */

// Imports
require_once 'controllers/CharactersController.php';

/**
 * Lecture de tous les enregistrements
 */
$router->get('/characters/all', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new CharactersController($db))->getCharacters($token);
});

/**
 * Lecture d'un enregistrement
 */
$router->get('/characters/campaign/:campaignId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CharactersController($db))->getCharacter($token, $campaignId);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/characters/campaign/:campaignId/create', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CharactersController($db))->createCharacter($token, $campaignId, $_POST, $_FILES);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/characters/character/:characterId/update', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $characterId = DataHelper::parseIntParam($params['characterId']);

    // Appel contrôleur
    (new CharactersController($db))->updateCharacter($token, $characterId, $_POST, $_FILES);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/characters/import', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new CharactersController($db))->importCharacter($token, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/characters/campaign/:campaignId/detach', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CharactersController($db))->detachCharacter($token, $campaignId);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/characters/character/:characterId/delete', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $characterId = DataHelper::parseIntParam($params['characterId']);

    // Appel contrôleur
    (new CharactersController($db))->deleteCharacter($token, $characterId);
});
