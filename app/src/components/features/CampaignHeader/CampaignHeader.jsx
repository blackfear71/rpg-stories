import { useTranslation } from 'react-i18next';

import { BiLink } from 'react-icons/bi';
import { FaPlus } from 'react-icons/fa6';
import { GiCastle, GiDoorway, GiMeepleGroup, GiSpellBook } from 'react-icons/gi';
import { MdDelete, MdEdit, MdRestorePage } from 'react-icons/md';

import { TooltipButton } from '../../../components/shared';

import { EnumAction, EnumTab } from '../../../enums';

import './CampaignHeader.css';

/**
 * Liste des histoires
 */
const CampaignHeader = ({
    activeTab,
    campaign,
    storyCount,
    draftsState,
    hasCharacter,
    inputOptions,
    onOpenStoryInput,
    onOpenDraftsModal,
    onOpenCampaignModal,
    onOpenCharacterModal,
    onOpenImportModal,
    onConfirm,
    isSubmitting
}) => {
    // Traductions
    const { t } = useTranslation();

    // Contexte
    const { drafts, draftLoading } = draftsState;

    return (
        <div
            className="d-flex flex-row align-items-center p-3 gap-3 rounded campaign-header-container"
            style={
                campaign.picture
                    ? {
                          backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/campaigns?file=${encodeURIComponent(campaign.picture)})`
                      }
                    : undefined
            }
        >
            {/* Infos */}
            <div className="d-flex flex-column align-items-start gap-2">
                {/* Nom de la campagne */}
                <div className="d-flex align-items-center gap-2 py-1 px-2 fs-2 rounded campaign-header-title">
                    <GiSpellBook className="campaign-header-icon-large" />
                    {campaign.name}
                </div>

                {/* Univers */}
                {campaign.universe && (
                    <div className="d-flex align-items-center gap-2 py-1 px-2 fs-6 rounded campaign-header-badge-italic">
                        <GiCastle className="campaign-header-icon-small" />
                        {campaign.universe}
                    </div>
                )}

                {/* Nombre de joueurs */}
                <div className="d-flex align-items-center gap-2 py-1 px-2 fs-6 rounded campaign-header-badge">
                    <GiMeepleGroup className="campaign-header-icon-small" />
                    {t(campaign.players === 1 ? 'campaign.countPlayer' : 'campaign.countPlayers', {
                        count: campaign.players
                    })}
                </div>

                {/* Nombre de sessions */}
                {storyCount > 0 && (
                    <div className="d-flex align-items-center gap-2 py-1 px-2 fs-6 rounded campaign-header-badge">
                        <GiDoorway className="campaign-header-icon-small" />
                        {t(storyCount === 1 ? 'campaign.countStory' : 'campaign.countStories', {
                            count: storyCount
                        })}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2 ms-auto">
                {/* Personnage */}
                {activeTab === EnumTab.CHARACTER && !hasCharacter && (
                    <>
                        {/* Création personnage */}
                        <TooltipButton
                            tooltip={t('character.createCharacter')}
                            content={<FaPlus size={25} />}
                            variant="outline-icon-action"
                            className="campaign-header-button"
                            onClick={() => onOpenCharacterModal(EnumAction.CREATE)}
                            isSubmitting={isSubmitting}
                        />

                        {/* Import personnage*/}
                        <TooltipButton
                            tooltip={t('character.importCharacter')}
                            content={<BiLink size={25} />}
                            variant="outline-icon-action"
                            className="campaign-header-button"
                            onClick={onOpenImportModal}
                            isSubmitting={isSubmitting}
                        />
                    </>
                )}

                {/* Campagne */}
                {activeTab === EnumTab.CAMPAIGN && !inputOptions?.isOpen && (
                    <>
                        {/* Ajout histoire */}
                        <TooltipButton
                            tooltip={t('campaign.createStory')}
                            content={<FaPlus size={25} />}
                            variant="outline-icon-action"
                            className="campaign-header-button"
                            onClick={() => onOpenStoryInput(EnumAction.CREATE)}
                            isSubmitting={isSubmitting}
                        />

                        {/* Brouillons */}
                        {!draftLoading && drafts && drafts.length > 0 && (
                            <TooltipButton
                                tooltip={t('campaign.drafts')}
                                content={<MdRestorePage size={25} />}
                                variant="outline-icon-action"
                                className="campaign-header-button"
                                onClick={onOpenDraftsModal}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </>
                )}

                {/* Modification campagne */}
                <TooltipButton
                    tooltip={t('campaign.updateCampaign')}
                    content={<MdEdit size={25} />}
                    variant="outline-icon-action"
                    className="campaign-header-button"
                    onClick={() => onOpenCampaignModal(EnumAction.UPDATE)}
                    isSubmitting={isSubmitting}
                />

                {/* Suppression campagne */}
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
    );
};

export default CampaignHeader;
