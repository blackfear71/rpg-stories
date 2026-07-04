/**
 * Fonction de conversion des messages back vers front ou erreur inconnue
 * @param {*} code Code du message back
 * @param {*} params Paramètres optionnels du message back
 * @param {*} t Méthode de traduction
 * @returns Message front convertit
 */
export const getMessageTranslationKey = (code, params, t) => {
    // Mapping des messages entre BACK et FRONT
    const map = {
        // Erreurs
        ERR_CREATION_FAILED: 'errors.creationFailed',
        ERR_CREATION_FOLDER_FAILED: 'errors.creationFailed',
        ERR_CREATION_IMAGE_FAILED: 'errors.creationImageFailed',
        ERR_DB_CONNECTION: 'errors.unknownError',
        ERR_DELETION_FAILED: 'errors.deletionFailed',
        ERR_DELETION_FILE_FAILED: 'errors.deletionFileFailed',
        ERR_EDITION_NOT_FOUND: 'errors.editionNotFound',
        ERR_EDITION_FINISHED: 'errors.editionFinished',
        ERR_ENV_FILES_DIR_MISSING: 'errors.unknownError',
        ERR_FILE_NOT_FOUND: 'errors.fileNotFound',
        ERR_FILE_TOO_LARGE: 'errors.fileTooLarge',
        ERR_GIFT_NOT_FOUND: 'errors.giftNotFound',
        ERR_INVALID_AUTH: 'errors.invalidAuth',
        ERR_INVALID_DATE: 'errors.invalidStartDate',
        ERR_INVALID_END_TIME: 'errors.invalidEndTime',
        ERR_INVALID_FILE: 'errors.invalidFile',
        ERR_INVALID_FILE_FORMAT: 'errors.invalidFileFormat',
        ERR_INVALID_GIFT_POINTS: 'errors.invalidGiftPoints',
        ERR_INVALID_ID: 'errors.unknownError',
        ERR_INVALID_ID_MATCH: 'errors.unknownError',
        ERR_INVALID_IMAGE: 'errors.invalidImage',
        ERR_INVALID_LEVEL: 'errors.invalidLevel',
        ERR_INVALID_LOCATION: 'errors.invalidLocation',
        ERR_INVALID_NAME: 'errors.invalidName',
        ERR_INVALID_PARAMETER: 'errors.unknownError',
        ERR_INVALID_PASSWORD: 'errors.invalidPassword',
        ERR_INVALID_PASSWORD_MATCH: 'errors.passwordMatch',
        ERR_INVALID_POINTS: 'errors.invalidPoints',
        ERR_INVALID_QUANTITY: 'errors.invalidQuantity',
        ERR_INVALID_START_TIME: 'errors.invalidStartTime',
        ERR_INVALID_TOKEN: 'errors.unknownError',
        ERR_INVALID_VALUE: 'errors.invalidValue',
        ERR_LOGIN_FAILED: 'errors.loginFailed',
        ERR_LOGOUT_FAILED: 'errors.logoutFailed',
        ERR_MISSING_PARAMS: 'errors.unknownError',
        ERR_ORIGIN_NOT_ALLOWED: 'errors.unknownError',
        ERR_PLAYER_GIVEAWAY: 'errors.playerGiveaway',
        ERR_PLAYER_NOT_FOUND: 'errors.playerNotFound',
        ERR_QUANTITY_ATTRIBUTION: 'errors.quantityAttribution',
        ERR_RESET_PASSWORD_FAILED: 'errors.resetPasswordFailed',
        ERR_REWARD_NOT_FOUND: 'errors.rewardNotFound',
        ERR_ROUTE_NOT_FOUND: 'errors.unknownError',
        ERR_SSE_GIFTS: 'errors.unknownError',
        ERR_SSE_PLAYERS: 'errors.unknownError',
        ERR_UNAUTHORIZED_ACTION: 'errors.unauthorizedAction',
        ERR_UNKNOWN_ENDPOINT: 'errors.unknownError',
        ERR_UNKNOWN_ERROR: 'errors.unknownError',
        ERR_UPDATE_FAILED: 'errors.updateFailed',
        ERR_UPDATE_PASSWORD_FAILED: 'errors.updatePasswordFailed',
        ERR_UPLOAD_FAILED: 'errors.uploadFailed',
        ERR_USER_NOT_FOUND: 'errors.userNotFound',
        ERR_USER_PASSWORD_INVALID: 'errors.invalidAuth',
        ERR_WEBP_CONVERSION_FAILED: 'errors.webpConversionFailed',

        // Messages
        MSG_CREATION_SUCCESS: 'messages.creationSuccess',
        MSG_DELETION_SUCCESS: 'messages.deletionSuccess',
        MSG_LOGIN_SUCCESS: 'messages.loginSuccess',
        MSG_LOGOUT_SUCCESS: 'messages.logoutSuccess',
        MSG_RESET_PASSWORD_SUCCESS: 'messages.resetPasswordSuccess',
        MSG_REWARD_SUCCESS: 'messages.rewardSuccess',
        MSG_UPDATE_SUCCESS: 'messages.updateSuccess',

        // Alertes
        WRN_LAST_ADMIN: 'warnings.lastAdmin',
        WRN_USER_EXISTS: 'warnings.userExists'
    };

    // Retourne la traduction
    return t(map[code] || 'errors.unknownError', params || {});
};
