import i18next from 'i18next';

/**
 * Retourne une date au format YYYY-MM-DD (pour les champs de formulaire)
 * @param {*} date Date à convertir
 * @returns Date formatée
 */
export const getDayFromDate = (date) => {
    if (!date) {
        return '';
    }

    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);

    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Récupère une date formatée selon la langue active
 * @param {*} date Date à convertir
 * @param {*} options Options Intl.DateTimeFormat
 * @returns Date formatée
 */
export const getLocalizedDate = (date, options = {}) => {
    if (!date) {
        return '';
    }

    // Normalisation de la date (utile pour les formats "YYYY-MM-DD HH:mm:ss")
    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);

    // Récupération de la langue actuelle
    const locale = i18next.language || 'fr';

    // Options par défaut : DD/MM/YYYY
    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(jsDate);
};

/**
 * Formate une durée (en ms) selon la langue active
 * @param {*} ms Durée en ms
 * @param {*} options Options Intl.DateTimeFormat
 * @returns Durée formatée
 */
export const getLocalizedDuration = (ms, options = {}) => {
    if (!ms || ms < 0) {
        return '';
    }

    const totalMinutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const locale = i18next.language || 'fr';

    try {
        const defaultOptions = {
            style: 'digital',
            seconds: 'omit',
            ...options
        };
        return new Intl.DurationFormat(locale, defaultOptions).format({ hours, minutes });
    } catch {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
};

/**
 * Récupère l'heure d'une date selon la langue active
 * @param {*} date Date à convertir
 * @param {*} options Options Intl.DateTimeFormat
 * @returns Heure formatée
 */
export const getLocalizedTime = (date, options = {}) => {
    if (!date) {
        return '';
    }

    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);
    const locale = i18next.language || 'fr';

    // Options par défaut : HH:MM
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(jsDate);
};
