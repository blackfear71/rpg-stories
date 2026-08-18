import { Fragment, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { GiBookshelf, GiSpellBook } from 'react-icons/gi';
import { IoAddCircleOutline, IoClose } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

import { CampaignList } from '../../../components/features';
import { TooltipButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

import './SagaList.css';

/**
 * Liste des sagas
 */
const SagaList = ({ sagas, sagaCampaigns, onOpenSaga, onOpenSagaModal, onOpenCampaingModal, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const sagaPanelRefs = useRef({});

    /**
     * Scroll vers le panneau de campagnes à l'ouverture d'une saga
     */
    useEffect(() => {
        if (sagaCampaigns.isOpen && (sagaCampaigns.sagaId || sagaCampaigns.sagaId === 0)) {
            requestAnimationFrame(() => {
                sagaPanelRefs.current[sagaCampaigns.sagaId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }, [sagaCampaigns.isOpen, sagaCampaigns.sagaId]);

    /**
     * Enregistre / efface la ref DOM du panneau d'une saga
     * @param {*} sagaId Identifiant saga
     * @param {*} panel Panneau affiché
     */
    const registerSagaPanelRef = (sagaId, panel) => {
        if (panel) {
            sagaPanelRefs.current[sagaId] = panel;
        } else {
            delete sagaPanelRefs.current[sagaId];
        }
    };

    return (
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
            {sagas &&
                sagas.length > 0 &&
                sagas.map((saga) => (
                    <Fragment key={saga.id}>
                        <Button
                            className={`d-flex flex-column align-items-start justify-content-center p-3 gap-2 campaigns-button ${sagaCampaigns.isOpen && sagaCampaigns.sagaId === saga.id && 'saga-list-selected'}`}
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

                            {/* Badges */}
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
                            <div ref={(panel) => registerSagaPanelRef(sagaCampaigns.sagaId, panel)} className="rounded p-3 saga-list-panel">
                                {/* Entête */}
                                <div className="d-flex align-items-center justify-content-between gap-1 mb-3">
                                    {/* Titre de la saga */}
                                    <div className="d-flex align-items-center gap-2">
                                        <GiBookshelf size={30} className="saga-list-panel-icon" />
                                        <div className="saga-list-panel-title">{saga.name}</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-1">
                                        {sagaCampaigns.sagaId !== 0 && (
                                            <>
                                                {/* Suppression saga */}
                                                <TooltipButton
                                                    tooltip={t('common.delete')}
                                                    content={<MdDelete size={20} />}
                                                    variant="outline-icon-action"
                                                    className="saga-list-panel-button"
                                                    onClick={() => onConfirm(saga.id, saga.name)}
                                                    isSubmitting={isSubmitting}
                                                />

                                                {/* Modification saga */}
                                                <TooltipButton
                                                    tooltip={t('common.update')}
                                                    content={<MdEdit size={20} />}
                                                    variant="outline-icon-action"
                                                    className="saga-list-panel-button"
                                                    onClick={() => onOpenSagaModal(EnumAction.UPDATE, saga.id)}
                                                    isSubmitting={isSubmitting}
                                                />
                                            </>
                                        )}

                                        {/* Fermeture campagnes */}
                                        <TooltipButton
                                            tooltip={t('common.close')}
                                            content={<IoClose size={20} />}
                                            variant="outline-icon-action"
                                            className="saga-list-panel-button"
                                            onClick={() => onOpenSaga(saga.id)}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>
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
    );
};

export default SagaList;
