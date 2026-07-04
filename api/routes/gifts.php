<?php

/** @var PDO $db */

// Imports
require_once 'controllers/GiftsController.php';

/**
 * Lecture des enregistrements d'une édition
 */
$router->get('/gifts/edition/:editionId', function (array $params) use ($db): void {
    // Appel contrôleur
    (new GiftsController($db))->getEditionGifts($params['editionId']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/gifts/create/edition/:editionId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->createGift($token, $editionId, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/gifts/update/:giftId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $giftId = DataHelper::parseIntParam($params['giftId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->updateGift($token, $giftId, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/gifts/delete/:giftId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $giftId = DataHelper::parseIntParam($params['giftId']);

    // Appel contrôleur
    (new GiftsController($db))->deleteGift($token, $giftId);
});
