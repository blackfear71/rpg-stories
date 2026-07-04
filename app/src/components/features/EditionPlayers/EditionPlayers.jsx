import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { IoAddCircleOutline } from 'react-icons/io5';

import { EnumAction } from '../../../enums';

import PlayerList from './PlayerList/PlayerList';

/**
 * Liste des participants
 */
const EditionPlayers = ({ rights, players, onOpenPlayerModal, onOpenRewardModal, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Ajout */}
            {rights.isAdminOrSuperAdminOnEdition && (
                <div className="d-grid">
                    <Button variant="outline-action" onClick={() => onOpenPlayerModal(EnumAction.CREATE, null)} disabled={isSubmitting}>
                        <IoAddCircleOutline size={25} />
                        {t('edition.addPlayer')}
                    </Button>
                </div>
            )}

            {/* Liste */}
            {players && players.length > 0 ? (
                <div className="mt-3">
                    <PlayerList
                        rights={rights}
                        players={players}
                        onConfirm={onConfirm}
                        onOpenPlayerModal={onOpenPlayerModal}
                        onOpenRewardModal={onOpenRewardModal}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                <div className="px-2 py-3 mt-2 page-empty">{t('edition.noPlayers')}</div>
            )}
        </>
    );
};

export default EditionPlayers;
