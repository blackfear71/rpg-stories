import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import i18next from 'i18next';

import { Alert, Button } from 'react-bootstrap';

import { getMessageTranslationKey } from '../../../utils/helpers/messageHelper';

import './Message.css';

/**
 * Message
 */
const Message = ({ code, params = {}, type = 'error', inline = false, setMessage }) => {
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
            <Alert
                variant={getVariantFromType(type)}
                className={`d-flex align-items-center px-3 py-2 gap-2 justify-content-between message ${inline ? 'message-inline' : ''}`}
            >
                {/* Message FRONT ou BACK */}
                <span>{i18next.exists(code) ? t(code, params) : getMessageTranslationKey(code, params, t)}</span>

                {/* Bouton de fermeture */}
                {!autoClose && <Button variant="close" className="p-0 message-button-close" onClick={handleClose} />}
            </Alert>
        )
    );
};

export default Message;
