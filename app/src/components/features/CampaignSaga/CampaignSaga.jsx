import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from 'react-bootstrap';
import { GiSpellBook } from 'react-icons/gi';

import './CampaignSaga.css';

/**
 * Liste des histoires
 */
const CampaignSaga = ({ campaignId, saga, sagaCampaigns, isSubmitting }) => {
    // Router
    const navigate = useNavigate();

    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {saga && sagaCampaigns && (
                <div className="d-flex flex-column p-2 gap-2 rounded campaign-saga">
                    {/* Titre */}
                    <div className="ms-1 campaign-saga-title">{t('campaign.sagaCampaigns', { name: saga.name })}</div>

                    {/* Campagnes */}
                    <div className="d-flex gap-2">
                        {sagaCampaigns.map((sagaCampaign) => (
                            <Button
                                key={`sc-${sagaCampaign.id}`}
                                className={`d-flex flex-column align-items-start justify-content-center p-2 gap-2 campaign-saga-button ${sagaCampaign.id === campaignId && 'campaign-saga-selected'}`}
                                style={
                                    sagaCampaign.picture
                                        ? {
                                              backgroundImage: `url(${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(sagaCampaign.picture)})`
                                          }
                                        : undefined
                                }
                                onClick={() => navigate(`/campaign/${sagaCampaign.id}`)}
                                disabled={isSubmitting}
                            >
                                {/* Nom de la campagne */}
                                <div className="d-flex align-items-center gap-2 py-1 px-2 rounded campaign-saga-button-label">
                                    <GiSpellBook size={20} className="campaign-saga-button-icon" />
                                    <span className="campaign-saga-button-text">{sagaCampaign.name}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default CampaignSaga;
