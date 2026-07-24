import { useTranslation } from 'react-i18next';

import { FaPlus } from 'react-icons/fa6';
import { GiGalaxy, GiMeepleGroup, GiSpellBook } from 'react-icons/gi';
import { MdDelete, MdEdit } from 'react-icons/md';

import { TooltipButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Liste des histoires
 */
const CampaignHeader = ({ campaign, inputOptions, onOpenInput, onOpenModal, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            <div
                className="d-flex flex-row align-items-center p-3 gap-3 rounded campaign-header-container"
                style={
                    campaign.picture
                        ? {
                              backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(campaign.picture)})`
                          }
                        : undefined
                }
            >
                {/* Infos */}
                <div className="d-flex flex-column align-items-start gap-2">
                    {/* Nom de la campagne */}
                    <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaign-header-title">
                        <GiSpellBook className="campaign-header-icon-large" />
                        {campaign.name}
                    </div>

                    {/* Univers */}
                    <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaign-header-universe">
                        <GiGalaxy className="campaign-header-icon-medium" />
                        {campaign.universe}
                    </div>

                    {/* Nombre de joueurs */}
                    <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaign-header-players">
                        <GiMeepleGroup className="campaign-header-icon-small" />
                        {t(campaign.players === 1 ? 'campaign.countPlayer' : 'campaign.countPlayers', {
                            count: campaign.players
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column gap-2 ms-auto">
                    {/* Ajout histoire */}
                    {!inputOptions?.isOpen && (
                        <TooltipButton
                            tooltip={t('campaign.createStory')}
                            content={<FaPlus size={25} />}
                            variant="outline-icon-action"
                            className="campaign-header-button"
                            onClick={() => onOpenInput(EnumAction.CREATE)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modification */}
                    <TooltipButton
                        tooltip={t('campaign.updateCampaign')}
                        content={<MdEdit size={25} />}
                        variant="outline-icon-action"
                        className="campaign-header-button"
                        onClick={() => onOpenModal(EnumAction.UPDATE)}
                        isSubmitting={isSubmitting}
                    />

                    {/* Suppression */}
                    <TooltipButton
                        tooltip={t('campaign.deleteCampaign')}
                        content={<MdDelete size={25} />}
                        variant="outline-icon-action"
                        className="campaign-header-button"
                        onClick={onConfirm}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </>
    );
};

export default CampaignHeader;
