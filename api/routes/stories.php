<?php

/** @var PDO $db */

// Imports
require_once 'controllers/StoriesController.php';

/**
 * Lecture des enregistrements d'une campagne
 */
$router->get('/stories/campaign/:campaignId', function (array $params) use ($db): void {
    // Appel contrôleur
    (new StoriesController($db))->getCampaignStories($params['campaignId']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/stories/create/campaign/:campaignId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new StoriesController($db))->createStory($token, $campaignId, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/stories/update/:storyId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $storyId = DataHelper::parseIntParam($params['storyId']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new StoriesController($db))->updateStory($token, $storyId, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/stories/delete/:storyId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $storyId = DataHelper::parseIntParam($params['storyId']);

    // Appel contrôleur
    (new StoriesController($db))->deleteStory($token, $storyId);
});
