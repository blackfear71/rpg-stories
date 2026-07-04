<?php
class MessageHelper
{
    /*****************/
    /* Codes erreurs */
    /*****************/
    // Commun
    const ERR_CREATION_FAILED        = 'ERR_CREATION_FAILED';
    const ERR_CREATION_FOLDER_FAILED = 'ERR_CREATION_FOLDER_FAILED';
    const ERR_CREATION_IMAGE_FAILED  = 'ERR_CREATION_IMAGE_FAILED';
    const ERR_DB_CONNECTION          = 'ERR_DB_CONNECTION';
    const ERR_DELETION_FAILED        = 'ERR_DELETION_FAILED';
    const ERR_DELETION_FILE_FAILED   = 'ERR_DELETION_FILE_FAILED';
    const ERR_ENV_FILES_DIR_MISSING  = 'ERR_ENV_FILES_DIR_MISSING';
    const ERR_FILE_NOT_FOUND         = 'ERR_FILE_NOT_FOUND';
    const ERR_FILE_TOO_LARGE         = 'ERR_FILE_TOO_LARGE';
    const ERR_INVALID_FILE           = 'ERR_INVALID_FILE';
    const ERR_INVALID_FILE_FORMAT    = 'ERR_INVALID_FILE_FORMAT';
    const ERR_INVALID_ID             = 'ERR_INVALID_ID';
    const ERR_INVALID_IMAGE          = 'ERR_INVALID_IMAGE';
    const ERR_INVALID_NAME           = 'ERR_INVALID_NAME';
    const ERR_INVALID_PARAMETER      = 'ERR_INVALID_PARAMETER';
    const ERR_INVALID_QUANTITY       = 'ERR_INVALID_QUANTITY';
    const ERR_MISSING_PARAMS         = 'ERR_MISSING_PARAMS';
    const ERR_ORIGIN_NOT_ALLOWED     = 'ERR_ORIGIN_NOT_ALLOWED';
    const ERR_ROUTE_NOT_FOUND        = 'ERR_ROUTE_NOT_FOUND';
    const ERR_UNKNOWN_ENDPOINT       = 'ERR_UNKNOWN_ENDPOINT';
    const ERR_UNKNOWN_ERROR          = 'ERR_UNKNOWN_ERROR';
    const ERR_UPDATE_FAILED          = 'ERR_UPDATE_FAILED';
    const ERR_UPLOAD_FAILED          = 'ERR_UPLOAD_FAILED';
    const ERR_WEBP_CONVERSION_FAILED = 'ERR_WEBP_CONVERSION_FAILED';

    const MSG_CREATION_SUCCESS = 'MSG_CREATION_SUCCESS';
    const MSG_DELETION_SUCCESS = 'MSG_DELETION_SUCCESS';
    const MSG_UPDATE_SUCCESS   = 'MSG_UPDATE_SUCCESS';

    // Editions
    const ERR_EDITION_NOT_FOUND  = 'ERR_EDITION_NOT_FOUND';
    const ERR_EDITION_FINISHED   = 'ERR_EDITION_FINISHED';
    const ERR_INVALID_DATE       = 'ERR_INVALID_DATE';
    const ERR_INVALID_END_TIME   = 'ERR_INVALID_END_TIME';
    const ERR_INVALID_LOCATION   = 'ERR_INVALID_LOCATION';
    const ERR_INVALID_START_TIME = 'ERR_INVALID_START_TIME';

    // Participants
    const ERR_INVALID_POINTS    = 'ERR_INVALID_POINTS';
    const ERR_PLAYER_GIVEAWAY   = 'ERR_PLAYER_GIVEAWAY';
    const ERR_PLAYER_NOT_FOUND  = 'ERR_PLAYER_NOT_FOUND';

    // Cadeaux
    const ERR_GIFT_NOT_FOUND       = 'ERR_GIFT_NOT_FOUND';
    const ERR_INVALID_VALUE        = 'ERR_INVALID_VALUE';
    const ERR_QUANTITY_ATTRIBUTION = 'ERR_QUANTITY_ATTRIBUTION';

    // Récompenses
    const ERR_INVALID_GIFT_POINTS = 'ERR_INVALID_GIFT_POINTS';
    const ERR_REWARD_NOT_FOUND    = 'ERR_REWARD_NOT_FOUND';

    const MSG_REWARD_SUCCESS = 'MSG_REWARD_SUCCESS';

    // Utilisateurs
    const ERR_INVALID_AUTH           = 'ERR_INVALID_AUTH';
    const ERR_INVALID_ID_MATCH       = 'ERR_INVALID_ID_MATCH';
    const ERR_INVALID_LEVEL          = 'ERR_INVALID_LEVEL';
    const ERR_INVALID_PASSWORD       = 'ERR_INVALID_PASSWORD';
    const ERR_INVALID_PASSWORD_MATCH = 'ERR_INVALID_PASSWORD_MATCH';
    const ERR_INVALID_TOKEN          = 'ERR_INVALID_TOKEN';
    const ERR_LOGIN_FAILED           = 'ERR_LOGIN_FAILED';
    const ERR_LOGOUT_FAILED          = 'ERR_LOGOUT_FAILED';
    const ERR_RESET_PASSWORD_FAILED  = 'ERR_RESET_PASSWORD_FAILED';
    const ERR_UNAUTHORIZED_ACTION    = 'ERR_UNAUTHORIZED_ACTION';
    const ERR_UPDATE_PASSWORD_FAILED = 'ERR_UPDATE_PASSWORD_FAILED';
    const ERR_USER_NOT_FOUND         = 'ERR_USER_NOT_FOUND';
    const ERR_USER_PASSWORD_INVALID  = 'ERR_USER_PASSWORD_INVALID';

    const MSG_LOGIN_SUCCESS          = 'MSG_LOGIN_SUCCESS';
    const MSG_LOGOUT_SUCCESS         = 'MSG_LOGOUT_SUCCESS';
    const MSG_RESET_PASSWORD_SUCCESS = 'MSG_RESET_PASSWORD_SUCCESS';

    const WRN_LAST_ADMIN  = 'WRN_LAST_ADMIN';
    const WRN_USER_EXISTS = 'WRN_USER_EXISTS';

    // SSE
    const ERR_SSE_GIFTS   = 'ERR_SSE_GIFTS';
    const ERR_SSE_PLAYERS = 'ERR_SSE_PLAYERS';

    /******************************/
    /* Codes HTTP + messages logs */
    /******************************/
    private static array $definitions = [
        // Commun
        self::ERR_CREATION_FAILED        => ['http' => 400, 'message' => 'Erreur lors de la création en base de données'],
        self::ERR_CREATION_FOLDER_FAILED => ['http' => 500, 'message' => 'Erreur lors de la création du dossier des images'],
        self::ERR_CREATION_IMAGE_FAILED  => ['http' => 400, 'message' => 'Erreur lors de la création de l\'image'],
        self::ERR_DB_CONNECTION          => ['http' => 500, 'message' => 'Connexion impossible à la base de données'],
        self::ERR_DELETION_FAILED        => ['http' => 400, 'message' => 'Erreur lors de la suppression en base de données'],
        self::ERR_DELETION_FILE_FAILED   => ['http' => 500, 'message' => 'Erreur lors de la suppression du fichier sur le serveur'],
        self::ERR_ENV_FILES_DIR_MISSING  => ['http' => 500, 'message' => 'Dossier serveur introuvable dans le fichier d\'environnement'],
        self::ERR_FILE_NOT_FOUND         => ['http' => 404, 'message' => 'Le fichier est introuvable'],
        self::ERR_FILE_TOO_LARGE         => ['http' => 400, 'message' => 'Le fichier est trop volumineux'],
        self::ERR_INVALID_FILE           => ['http' => 400, 'message' => 'Le fichier est invalide'],
        self::ERR_INVALID_FILE_FORMAT    => ['http' => 400, 'message' => 'Le type MIME est invalide'],
        self::ERR_INVALID_ID             => ['http' => 400, 'message' => 'L\'identifiant est obligatoire'],
        self::ERR_INVALID_IMAGE          => ['http' => 400, 'message' => 'L\'image est invalide'],
        self::ERR_INVALID_NAME           => ['http' => 400, 'message' => 'Le nom est obligatoire'],
        self::ERR_INVALID_PARAMETER      => ['http' => 400, 'message' => 'Paramètre d\'entrée invalide'],
        self::ERR_INVALID_QUANTITY       => ['http' => 400, 'message' => 'La quantité doit être supérieure à 0'],
        self::ERR_MISSING_PARAMS         => ['http' => 400, 'message' => 'Paramètres manquants'],
        self::ERR_ORIGIN_NOT_ALLOWED     => ['http' => 403, 'message' => 'Origine non autorisée'],
        self::ERR_ROUTE_NOT_FOUND        => ['http' => 404, 'message' => 'Route non trouvée'],
        self::ERR_UNKNOWN_ENDPOINT       => ['http' => 404, 'message' => 'Endpoint inconnu'],
        self::ERR_UNKNOWN_ERROR          => ['http' => 500, 'message' => 'Erreur inconnue'],
        self::ERR_UPDATE_FAILED          => ['http' => 400, 'message' => 'Erreur lors de la modification en base de données'],
        self::ERR_UPLOAD_FAILED          => ['http' => 400, 'message' => 'Envoi échoué dans le dossier de destination'],
        self::ERR_WEBP_CONVERSION_FAILED => ['http' => 400, 'message' => 'Conversion WebP échouée'],

        self::MSG_CREATION_SUCCESS       => ['http' => 201, 'message' => 'Création effectuée avec succès'],
        self::MSG_DELETION_SUCCESS       => ['http' => 204, 'message' => 'Suppression effectuée avec succès'],
        self::MSG_UPDATE_SUCCESS         => ['http' => 200, 'message' => 'Modification effectuée avec succès'],

        // Editions
        self::ERR_EDITION_NOT_FOUND  => ['http' => 404, 'message' => 'Erreur lors de la récupération de l\'édition'],
        self::ERR_EDITION_FINISHED   => ['http' => 422, 'message' => 'Edition terminée ou introuvable'],
        self::ERR_INVALID_DATE       => ['http' => 400, 'message' => 'Le format de la date est invalide'],
        self::ERR_INVALID_END_TIME   => ['http' => 400, 'message' => 'Le format de l\'heure de fin est invalide'],
        self::ERR_INVALID_LOCATION   => ['http' => 400, 'message' => 'Le lieu est obligatoire'],
        self::ERR_INVALID_START_TIME => ['http' => 400, 'message' => 'Le format de l\'heure de début est invalide'],

        // Participants
        self::ERR_INVALID_POINTS   => ['http' => 400, 'message' => 'Le nombre de points doit être supérieur ou égal à 0'],
        self::ERR_PLAYER_GIVEAWAY  => ['http' => 400, 'message' => 'Le don de points n\'est pas correctement renseigné'],
        self::ERR_PLAYER_NOT_FOUND => ['http' => 404, 'message' => 'Erreur lors de la récupération du participant'],

        // Cadeaux
        self::ERR_GIFT_NOT_FOUND       => ['http' => 404, 'message' => 'Erreur lors de la récupération du cadeau'],
        self::ERR_INVALID_VALUE        => ['http' => 400, 'message' => 'La valeur doit être supérieure à 0'],
        self::ERR_QUANTITY_ATTRIBUTION => ['http' => 400, 'message' => 'La quantité doit être supérieure ou égale au nombre de cadeaux déjà attribués'],

        // Récompenses
        self::ERR_INVALID_GIFT_POINTS => ['http' => 400, 'message' => 'Le nombre de points est insuffisant pour le cadeau'],
        self::ERR_REWARD_NOT_FOUND    => ['http' => 404, 'message' => 'Erreur lors de la récupération de la récompense'],

        self::MSG_REWARD_SUCCESS      => ['http' => 200, 'message' => 'Récompense attribuée avec succès'],

        // Utilisateurs
        self::ERR_INVALID_AUTH           => ['http' => 401, 'message' => 'Authentification invalide'],
        self::ERR_INVALID_ID_MATCH       => ['http' => 400, 'message' => 'Un utilisateur ne peut pas se supprimer'],
        self::ERR_INVALID_LEVEL          => ['http' => 400, 'message' => 'Le niveau est invalide'],
        self::ERR_INVALID_PASSWORD       => ['http' => 400, 'message' => 'Le mot de passe est obligatoire'],
        self::ERR_INVALID_PASSWORD_MATCH => ['http' => 400, 'message' => 'Les mots de passe ne correspondent pas'],
        self::ERR_INVALID_TOKEN          => ['http' => 401, 'message' => 'Le token de connexion est invalide'],
        self::ERR_LOGIN_FAILED           => ['http' => 401, 'message' => 'Échec d\'authentification'],
        self::ERR_LOGOUT_FAILED          => ['http' => 401, 'message' => 'Erreur lors de la déconnexion'],
        self::ERR_RESET_PASSWORD_FAILED  => ['http' => 400, 'message' => 'Erreur lors de la réinitialisation du mot de passe'],
        self::ERR_UNAUTHORIZED_ACTION    => ['http' => 403, 'message' => 'Action non autorisée'],
        self::ERR_UPDATE_PASSWORD_FAILED => ['http' => 400, 'message' => 'Erreur lors de la modification du mot de passe'],
        self::ERR_USER_NOT_FOUND         => ['http' => 404, 'message' => 'Erreur lors de la récupération de l\'utilisateur'],
        self::ERR_USER_PASSWORD_INVALID  => ['http' => 401, 'message' => 'Le mot de passe saisi est incorrect'],

        self::WRN_LAST_ADMIN             => ['http' => 403, 'message' => 'Il doit rester au moins un Super Administrateur actif'],
        self::WRN_USER_EXISTS            => ['http' => 409, 'message' => 'L\'identifiant existe déjà'],

        self::MSG_LOGIN_SUCCESS          => ['http' => 200, 'message' => 'Connexion réussie'],
        self::MSG_LOGOUT_SUCCESS         => ['http' => 200, 'message' => 'Déconnexion réussie'],
        self::MSG_RESET_PASSWORD_SUCCESS => ['http' => 200, 'message' => 'Réinitialisation du mot de passe réussie'],

        // SSE
        self::ERR_SSE_GIFTS   => ['http' => 500, 'message' => 'Erreur SSE lors de la récupération des cadeaux'],
        self::ERR_SSE_PLAYERS => ['http' => 500, 'message' => 'Erreur SSE lors de la récupération des participants'],
    ];

    /**
     * Récupère le message avec ses arguments
     */
    public static function message(string $code, string $class, string $function, array $data): string
    {
        $template = self::$definitions[$code]['message'] ?? self::$definitions[self::ERR_UNKNOWN_ERROR]['message'];
        $context = count($data) ? ' : [' . implode(', ', $data) . ']' : '';
        $location = match (true) {
            $class && $function => " [{$class} > {$function}]",
            $class              => " [{$class}]",
            default             => '',
        };

        return sprintf('[%s]%s %s%s', $code, $location, $template, $context);
    }

    /**
     * Récupère le code d'erreur HTTP
     */
    public static function httpCode(string $code, int $default = 500): int
    {
        if ($code === '' || !isset(self::$definitions[$code])) {
            return $default;
        }

        return self::$definitions[$code]['http'];
    }
}
