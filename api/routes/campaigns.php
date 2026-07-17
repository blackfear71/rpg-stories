<?php

/** @var PDO $db */

// Imports
require_once 'controllers/CampaignsController.php';

/**
 * Lecture de tous les enregistrements
 */
$router->get('/campaigns/all', function () use ($db): void {
    // Appel contrôleur
    (new CampaignsController($db))->getCampaigns();
});

/**
 * Lecture d'un enregistrement
 */
$router->get('/campaigns/campaign/:campaignId', function (array $params) use ($db): void {
    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CampaignsController($db))->getCampaign($campaignId);
});

/**
 * Lecture des campagnes recherchées
 */
$router->post('/campaigns/search', function () use ($db): void {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new CampaignsController($db))->getSearchCampaigns($data['search']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/campaigns/create', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new CampaignsController($db))->createCampaign($token, $_POST, $_FILES);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/campaigns/update/:campaignId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CampaignsController($db))->updateCampaign($token, $campaignId, $_POST, $_FILES);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/campaigns/delete/:campaignId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $campaignId = DataHelper::parseIntParam($params['campaignId']);

    // Appel contrôleur
    (new CampaignsController($db))->deleteCampaign($token, $campaignId);
});
