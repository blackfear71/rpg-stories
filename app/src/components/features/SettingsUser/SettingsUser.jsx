import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { HiKey } from 'react-icons/hi2';

/**
 * Gestion de l'utilisateur connecté
 */
const SettingsUser = ({ user, onOpen, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Utilisateur */}
            <div className="d-flex align-items-center gap-2 p-2 mt-3 settings-item">
                {/* Icône */}
                <div className="d-flex align-items-center justify-content-center settings-item-icon">{user.role?.icon}</div>

                {/* Identifiant et rôle */}
                <div className="d-flex flex-column flex-grow-1 settings-item-name">
                    <span className="settings-item-ellipsis-text">{user.login}</span>
                    <div className="d-flex align-items-center gap-2 settings-item-role">{user.role?.label}</div>
                </div>

                {/* Mot de passe */}
                <Button
                    onClick={() => onOpen()}
                    className="settings-item-button"
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    disabled={isSubmitting}
                >
                    <HiKey className="svg-large" color={isSubmitting ? 'gray' : 'white'} />
                </Button>
            </div>

            {/* Description */}
            {user.level !== '' && <div className="mt-3 px-2 py-1 settings-description">{t(`settings.levelDescription${user.level}`)}</div>}
        </>
    );
};

export default SettingsUser;
