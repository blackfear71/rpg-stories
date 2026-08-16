import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { GiBookshelf, GiSpellBook } from 'react-icons/gi';
import { IoAddCircleOutline } from 'react-icons/io5';

import { CampaignList } from '../../../components/features';

import { EnumAction } from '../../../enums';

import './SagaList.css';

/**
 * Liste des sagas
 */
const SagaList = ({ sagas, sagaCampaigns, onOpenSaga, onOpenSagaModal, onOpenCampaingModal, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Liste des sagas */}
            <div className="gap-3 campaigns-list-container">
                {/* Ajout */}
                <Button
                    className="d-flex flex-column align-items-center justify-content-center gap-2 campaigns-button"
                    onClick={() => onOpenSagaModal(EnumAction.CREATE)}
                    disabled={isSubmitting}
                >
                    <IoAddCircleOutline size={30} />
                    {t('campaign.createSaga')}
                </Button>

                {/* Sagas */}
                {/* TODO : il va falloir pouvoir modifier/supprimer les sagas => boutons à l'intérieur des campagnes dépliées */}
                {sagas &&
                    sagas.length > 0 &&
                    sagas.map((saga) => (
                        <Fragment key={saga.id}>
                            <Button
                                className={`d-flex flex-column align-items-start justify-content-center p-3 gap-2 campaigns-button ${sagaCampaigns.isOpen && sagaCampaigns.sagaId === saga.id && 'saga-list-panel-selected'}`}
                                style={
                                    saga.picture
                                        ? {
                                              backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(saga.picture)})`
                                          }
                                        : undefined
                                }
                                onClick={() => onOpenSaga(saga.id)}
                                disabled={isSubmitting}
                            >
                                {/* Nom de la saga */}
                                <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaigns-button-label">
                                    <GiBookshelf size={30} className="campaigns-button-icon" />
                                    <span className="campaigns-button-text">{saga.name}</span>
                                </div>

                                <div className="d-flex gap-2 campaigns-button-badges-wrapper">
                                    {/* Nombre de campagnes */}
                                    <div className="d-flex align-items-center gap-1 py-1 px-2 rounded campaigns-button-badge">
                                        <GiSpellBook size={20} className="campaigns-button-icon" />
                                        <span className="campaigns-button-text">
                                            {t(saga.campaignCount === 1 ? 'campaign.countCampaign' : 'campaign.countCampaigns', {
                                                count: saga.campaignCount
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Button>

                            {/* Campagnes d'une saga */}
                            {sagaCampaigns.isOpen && sagaCampaigns.sagaId === saga.id && (
                                <div className="rounded p-3 saga-list-panel">
                                    {/* Bouton fermeture */}
                                    <div className="d-flex justify-content-end mb-3">
                                        <Button
                                            variant="outline-text-action"
                                            className="gap-1 saga-list-panel-close-button"
                                            onClick={() => onOpenSaga(saga.id)}
                                        >
                                            <FaTimes />
                                            {t('common.close')}
                                        </Button>
                                    </div>

                                    {/* Liste des campagnes de la saga */}
                                    <CampaignList
                                        campaigns={sagaCampaigns.campaigns}
                                        sagaId={saga.id}
                                        onOpen={onOpenCampaingModal}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            )}
                        </Fragment>
                    ))}
            </div>
        </>
    );
};

export default SagaList;
