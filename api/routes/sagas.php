<?php

/** @var PDO $db */

// Imports
require_once 'controllers/SagasController.php';

/**
 * Lecture de tous les enregistrements
 */
$router->get('/sagas/all', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new SagasController($db))->getSagas($token);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/sagas/create', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new SagasController($db))->createSaga($token, $_POST);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/sagas/saga/:sagaId/update', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $sagaId = DataHelper::parseIntParam($params['sagaId']);

    // Appel contrôleur
    (new SagasController($db))->updateSaga($token, $sagaId, $_POST);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/sagas/saga/:sagaId/delete', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $sagaId = DataHelper::parseIntParam($params['sagaId']);

    // Appel contrôleur
    (new SagasController($db))->deleteSaga($token, $sagaId);
});
