import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { IoAddCircleOutline } from 'react-icons/io5';

import { EnumAction } from '../../../enums';

import UserList from './UserList/UserList';

/**
 * Gestion des utilisateurs
 */
const SettingsUsers = ({ users, onOpen, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Ajout */}
            <Button variant="action" className="w-100 gap-1 mb-2" onClick={() => onOpen(EnumAction.CREATE, null)} disabled={isSubmitting}>
                <IoAddCircleOutline size={25} />
                {t('settings.addUser')}
            </Button>

            {/* Liste */}
            {users && users.length > 0 ? (
                <div className="mt-3">
                    <UserList users={users} onOpen={onOpen} onConfirm={onConfirm} isSubmitting={isSubmitting} />
                </div>
            ) : (
                <div className="px-2 py-3 mt-2 page-empty">{t('settings.noUsers')}</div>
            )}
        </>
    );
};

export default SettingsUsers;
