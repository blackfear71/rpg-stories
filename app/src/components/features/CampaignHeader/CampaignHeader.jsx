import { useTranslation } from 'react-i18next';

import { FaPlus } from 'react-icons/fa6';
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
                    <div className="py-1 px-2 rounded campaign-header-title">{campaign.name}</div>
                    <div className="py-1 px-2 rounded campaign-header-universe">{campaign.universe}</div>
                    <div className="py-1 px-2 rounded campaign-header-players">
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
                            icon={<FaPlus size={25} />}
                            onClick={() => onOpenInput(EnumAction.CREATE)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modification */}
                    <TooltipButton
                        tooltip={t('campaign.updateCampaign')}
                        icon={<MdEdit size={25} />}
                        onClick={() => onOpenModal(EnumAction.UPDATE)}
                        isSubmitting={isSubmitting}
                    />

                    {/* Suppression */}
                    <TooltipButton
                        tooltip={t('campaign.deleteCampaign')}
                        icon={<MdDelete size={25} />}
                        onClick={onConfirm}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </>
    );
};

export default CampaignHeader;
