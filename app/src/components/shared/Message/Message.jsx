import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import i18next from 'i18next';

import { Alert } from 'react-bootstrap';

import { getMessageTranslationKey } from '../../../utils/helpers/messageHelper';

/**
 * Message
 */
const Message = ({ code, params = {}, type = 'error', setMessage }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [showMessage, setShowMessage] = useState(true);

    // Constantes
    const autoClose = type === 'success';

    /**
     * Fermeture automatique du message
     */
    useEffect(() => {
        if (autoClose && showMessage) {
            const timer = setTimeout(() => {
                setShowMessage(false);
                setMessage?.(null);
            }, 10000);

            // Nettoyage si le composant est démonté avant
            return () => clearTimeout(timer);
        }
    }, [autoClose, showMessage, setMessage]);

    /**
     * Fermeture manuelle du message
     */
    const handleClose = () => {
        setShowMessage(false);
        setMessage?.(null);
    };

    /**
     * Détermination de la couleur selon le type de message
     */
    const getVariantFromType = (messageType) =>
        ({
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info'
        })[messageType] || 'info';

    return (
        showMessage && (
            <Alert variant={getVariantFromType(type)} onClose={!autoClose && handleClose} dismissible={type !== 'success'}>
                {/* Message FRONT ou BACK */}
                {i18next.exists(code) ? t(code, params) : getMessageTranslationKey(code, params, t)}
            </Alert>
        )
    );
};

export default Message;
