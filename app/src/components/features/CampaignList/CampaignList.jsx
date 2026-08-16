import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from 'react-bootstrap';
import { GiCastle, GiMeepleGroup, GiSpellBook } from 'react-icons/gi';
import { IoAddCircleOutline } from 'react-icons/io5';

import { EnumAction } from '../../../enums';

/**
 * Liste des campagnes
 */
const CampaignList = ({ campaigns, onOpen, isSubmitting }) => {
    // Router
    const navigate = useNavigate();

    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Liste des campagnes */}
            <div className="gap-3 campaigns-list-container">
                {/* Ajout */}
                <Button
                    className="d-flex flex-column align-items-center justify-content-center gap-2 campaigns-button"
                    onClick={() => onOpen(EnumAction.CREATE)}
                    disabled={isSubmitting}
                >
                    <IoAddCircleOutline size={30} />
                    {t('campaign.createCampaign')}
                </Button>

                {/* Campagnes */}
                {campaigns &&
                    campaigns.length > 0 &&
                    campaigns.map((campaign) => (
                        <Button
                            key={campaign.id}
                            className="d-flex flex-column align-items-start justify-content-center p-3 gap-2 campaigns-button"
                            style={
                                campaign.picture
                                    ? {
                                          backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(campaign.picture)})`
                                      }
                                    : undefined
                            }
                            onClick={() => navigate(`/campaign/${campaign.id}`)}
                            disabled={isSubmitting}
                        >
                            {/* Nom de la campagne */}
                            <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaigns-button-label">
                                <GiSpellBook size={30} className="campaigns-button-icon" />
                                <span className="campaigns-button-text">{campaign.name}</span>
                            </div>

                            <div className="d-flex gap-2 campaigns-button-badges-wrapper">
                                {/* Univers */}
                                {campaign.universe && (
                                    <div className="d-flex align-items-center gap-1 py-1 px-2 rounded campaigns-button-badge">
                                        <GiCastle size={20} className="campaigns-button-icon" />
                                        <span className="campaigns-button-text">{campaign.universe}</span>
                                    </div>
                                )}

                                {/* Nombre de joueurs */}
                                <div className="d-flex align-items-center gap-1 py-1 px-2 rounded campaigns-button-badge">
                                    <GiMeepleGroup size={20} className="campaigns-button-icon" />
                                    <span className="campaigns-button-text">
                                        {t(campaign.players === 1 ? 'campaign.countPlayer' : 'campaign.countPlayers', {
                                            count: campaign.players
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Button>
                    ))}
            </div>
        </>
    );
};

export default CampaignList;
