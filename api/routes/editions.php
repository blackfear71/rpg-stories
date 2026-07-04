<?php

/** @var PDO $db */

// Imports
require_once 'controllers/EditionsController.php';

/**
 * Lecture de tous les enregistrements
 */
$router->get('/editions/all', function () use ($db): void {
    // Appel contrôleur
    (new EditionsController($db))->getAllEditions();
});

/**
 * Lecture d'un enregistrement
 */
$router->get('/editions/edition/:editionId', function (array $params) use ($db): void {
    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Appel contrôleur
    (new EditionsController($db))->getEdition($editionId);
});

/**
 * Lecture des éditions recherchées
 */
$router->post('/editions/search', function () use ($db): void {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->getSearchEditions($data['search']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/editions/create', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new EditionsController($db))->createEdition($token, $_POST, $_FILES);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/editions/update/:editionId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Appel contrôleur
    (new EditionsController($db))->updateEdition($token, $editionId, $_POST, $_FILES);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/editions/delete/:editionId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Appel contrôleur
    (new EditionsController($db))->deleteEdition($token, $editionId);
});
