<?php

/** @var PDO $db */

// Imports
require_once 'controllers/RewardsController.php';

/**
 * Insertion d'un enregistrement
 */
$router->post('/rewards/create/gift/:giftId/player/:playerId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $giftId = DataHelper::parseIntParam($params['giftId']);
    $playerId = DataHelper::parseIntParam($params['playerId']);

    // Appel contrôleur
    (new RewardsController($db))->createReward($token, $giftId, $playerId);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/rewards/delete/:rewardId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $rewardId = DataHelper::parseIntParam($params['rewardId']);

    // Appel contrôleur
    (new RewardsController($db))->deleteReward($token, $rewardId);
});
