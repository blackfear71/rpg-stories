<?php
// Imports
require_once __DIR__ . '/enums/EnumAction.php';
require_once __DIR__ . '/enums/EnumUserRole.php';

require_once __DIR__ . '/models/dtos/ApiResponseDTO.php';

require_once __DIR__ . '/core/exceptions/WarningException.php';

require_once __DIR__ . '/core/functions/Database.php';
require_once __DIR__ . '/core/functions/Router.php';

require_once __DIR__ . '/core/helpers/DataHelper.php';
require_once __DIR__ . '/core/helpers/EnvironmentHelper.php';
require_once __DIR__ . '/core/helpers/FileHelper.php';
require_once __DIR__ . '/core/helpers/LoggerHelper.php';
require_once __DIR__ . '/core/helpers/MessageHelper.php';
require_once __DIR__ . '/core/helpers/ResponseHelper.php';

// Connexion BDD
try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    ResponseHelper::error(MessageHelper::ERR_DB_CONNECTION, 'Index');
    exit;
}

// Préparation de l'URI
$basePath = dirname($_SERVER['SCRIPT_NAME']); // "/api"
$uri = strtok(substr($_SERVER['REQUEST_URI'], strlen($basePath)), '?');

// Paramètres CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',        // CRA
    'http://localhost:5173',        // Vite
    'http://rpg-stories.dedyn.io',  // HTTP
    'https://rpg-stories.dedyn.io', // HTTPS
];

// Headers de sécurité inconditionnels
header("X-Content-Type-Options: nosniff");
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");

// Headers CORS conditionnels selon l'origine
if (in_array($origin, $allowedOrigins)) {
    // CORS pour API classique
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
} elseif (!empty($origin)) {
    // Blocage des origines non autorisées
    ResponseHelper::error(MessageHelper::ERR_ORIGIN_NOT_ALLOWED, 'Index', '', [$origin]);
    exit;
}

// Gestion du preflight OPTIONS global
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Dispatch vers le bon groupe de routes
$router = new Router();

if (str_starts_with($uri, '/campaigns')) {
    require_once __DIR__ . '/routes/campaigns.php';
} elseif (str_starts_with($uri, '/stories')) {
    require_once __DIR__ . '/routes/stories.php';
} elseif (str_starts_with($uri, '/serve-file')) {
    require_once __DIR__ . '/routes/serve-file.php';
} elseif (str_starts_with($uri, '/users')) {
    require_once __DIR__ . '/routes/users.php';
} else {
    ResponseHelper::error(MessageHelper::ERR_UNKNOWN_ENDPOINT, 'Index', '', [$uri]);
    exit;
}

// Lance la route
$router->run();
