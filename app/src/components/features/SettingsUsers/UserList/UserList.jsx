import { useTranslation } from 'react-i18next';

import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';

import { TooltipButton } from '../../../../components/shared';

import { useAuth } from '../../../../utils/context/AuthContext';

import { EnumAction } from '../../../../enums';

/**
 * Liste des utilisateurs
 */
const UserList = ({ users, onOpen, onConfirm, isSubmitting }) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    /**
     * Ouvre la modale de suppression d'utilisateur
     * @param {*} user Utilisateur
     */
    const handleDelete = (user) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('settings.deleteUser', { name: user.login }),
            action: 'deleteUser',
            data: user.id
        });
    };

    return (
        <>
            {/* Liste */}
            {users?.map((u) => (
                <div key={u.id} className="d-flex align-items-center gap-2 p-2 mt-2 settings-item">
                    {/* Icône */}
                    <div className="d-flex align-items-center justify-content-center settings-item-icon">{u.role?.icon}</div>

                    {/* Identifiant et rôle */}
                    <div className="d-flex flex-column flex-grow-1 settings-item-name">
                        <span className="settings-item-ellipsis-text">
                            {u.login} {u.login === auth.login && t('settings.me')}
                        </span>
                        <div className="d-flex align-items-center gap-2 settings-item-role">{u.role?.label}</div>
                    </div>

                    {/* Supression */}
                    {u.login !== auth.login && (
                        <TooltipButton
                            tooltip={t('common.delete')}
                            content={<FaTrashCan color={isSubmitting ? 'gray' : 'white'} />}
                            variant="filled-icon-action"
                            className="settings-item-button"
                            onClick={() => handleDelete(u)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modification */}
                    <TooltipButton
                        tooltip={t('common.update')}
                        content={<FaAngleRight color={isSubmitting ? 'gray' : 'white'} />}
                        variant="filled-icon-action"
                        className="settings-item-button"
                        onClick={() => onOpen(EnumAction.UPDATE, u.id)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ))}
        </>
    );
};

export default UserList;
