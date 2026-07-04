import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';

/**
 * Bouton d'action avec confirmation intégrée
 */
const ConfirmInput = ({ title, buttonLabel, onConfirm }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [confirmActions, setConfirmActions] = useState(false);

    /**
     * Gère le comportement du formulaire à la soumission (réinitialisation mot de passe)
     * @param {*} e Evènement
     */
    const handleConfirm = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Remise en place des boutons de confirmation de réinitialisation de mot de passe
        setConfirmActions(false);

        // Soumets le formulaire
        onConfirm();
    };

    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && <div className="modal-group-content-title">{title}</div>}

            {!confirmActions ? (
                <div className="d-flex">
                    <Button type="button" variant="modal-action" onClick={() => setConfirmActions(true)}>
                        {buttonLabel}
                    </Button>
                </div>
            ) : (
                <div className="d-flex gap-2">
                    <Button type="button" variant="modal-outline-action" onClick={() => setConfirmActions(false)}>
                        {t('common.cancel')}
                    </Button>

                    <Button type="button" variant="modal-action" className="btn-red" onClick={handleConfirm}>
                        {t('common.confirm')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ConfirmInput;
