import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { GiBookshelf } from 'react-icons/gi';
import { IoAddCircleOutline } from 'react-icons/io5';

import { EnumAction } from '../../../enums';

/**
 * Liste des sagas
 */
const SagasList = ({ sagas, onOpen, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Liste des sagas */}
            <div className="gap-3 campaigns-grid">
                {/* Ajout */}
                <Button
                    className="d-flex flex-column align-items-center justify-content-center gap-2 campaigns-button"
                    onClick={() => onOpen(EnumAction.CREATE)}
                    disabled={isSubmitting}
                >
                    <IoAddCircleOutline size={30} />
                    {t('campaign.createSaga')}
                </Button>

                {/* Sagas */}
                {/* TODO : il va falloir pouvoir modifier/supprimer les sagas */}
                {/* TODO : il faudra aussi un groupe hors saga */}
                {sagas &&
                    sagas.length > 0 &&
                    sagas.map((saga) => (
                        <Button
                            key={saga.id}
                            className="d-flex flex-column align-items-start justify-content-center p-3 gap-2 campaigns-button"
                            // TODO : afficher la dernière image de la campagne la plus récente
                            // style={
                            //     campaign.picture
                            //         ? {
                            //               backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(campaign.picture)})`
                            //           }
                            //         : undefined
                            // }
                            // TODO : afficher les campagnes au clic
                            // onClick={() => navigate(`/campaign/${campaign.id}`)}
                            disabled={isSubmitting}
                        >
                            {/* Nom de la saga */}
                            <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaigns-button-label">
                                <GiBookshelf size={30} className="campaigns-button-icon" />
                                <span className="campaigns-button-text">{saga.name}</span>
                            </div>
                        </Button>
                    ))}
            </div>
        </>
    );
};

export default SagasList;
