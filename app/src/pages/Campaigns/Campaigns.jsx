import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Button, Spinner } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';

import { CampaignModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction } from '../../enums';

import { CampaignsService } from '../../api';

import './Campaigns.css';

// Valeurs initiales des formulaires
const initialCampaignValues = {
    name: '',
    universe: '',
    players: 0,
    picture: null,
    pictureAction: null
};

/**
 * Page des campagnes
 */
const Campaigns = () => {
    // Router
    const location = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, refreshAuth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsCampaign, setModalOptionsCampaign] = useState({
        action: null,
        isOpen: false,
        message: null
    });

    // API states
    const [campaigns, setCampaigns] = useState([]);

    /**
     * Schéma de validation Yup de la campagne
     */
    const campaignValidationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('errors.invalidName'), // TODO : trad
            players: Yup.number()
                .integer('errors.invalidPlayers')
                .min(1, 'errors.invalidPlayers')
                .typeError('errors.invalidPlayers')
                .required('errors.invalidPlayers'), // TODO : trad
            picture: Yup.mixed()
                .nullable()
                .test('file-type', 'errors.invalidFileType', (value) => {
                    if (!value || typeof value === 'string') {
                        return true;
                    }

                    return ['image/jpeg', 'image/png', 'image/webp'].includes(value.type);
                })
        });
    }, []);

    /**
     * Formik campagne
     */
    const formCampaign = useFormik({
        initialValues: initialCampaignValues,
        validationSchema: campaignValidationSchema,
        onSubmit: (values) => handleSubmitCampaign(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification
        refreshAuth(false);

        // Récupération des campagnes
        const campaignsService = new CampaignsService();

        campaignsService
            .getCampaigns()
            .pipe(
                map((dataCampaigns) => {
                    setCampaigns(dataCampaigns.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsLoading(false);
                })
            )
            .subscribe();
    }, []);

    /**
     * Redirection vers l'accueil si non connecté
     */
    useEffect(() => {
        if (!auth || !auth.isLoggedIn) {
            navigate('/');
        }
    }, [auth]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du navigate() (suppression campagne)
        if (location.state?.navMessage) {
            setMessage(location.state.navMessage);

            // Nettoyage du state React Router
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    /**
     * Réinitialisation à l'ouverture/fermeture de la modale campagne
     */
    useEffect(() => {
        formCampaign.resetForm();
    }, [modalOptionsCampaign.isOpen]);

    /**
     * Ouverture/fermeture de la modale de création de campagne
     * @param {*} action Action à réaliser
     */
    const openCloseCampaignModal = (action = null) => {
        // Ouverture ou fermeture
        setModalOptionsCampaign((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création campagne
     * @param {*} values Données du formulaire
     */
    const handleSubmitCampaign = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsCampaign((prev) => ({ ...prev, message: null }));

        // Formatage des données
        const body = formatDataCampaign(values);

        const campaignsService = new CampaignsService();

        campaignsService
            .createCampaign(body)
            .pipe(
                map((dataCampaign) => {
                    setMessage({ code: dataCampaign.response.message, type: dataCampaign.response.status });
                }),
                switchMap(() => campaignsService.getCampaigns()),
                map((dataCampaigns) => {
                    setCampaigns(dataCampaigns.response.data);
                    openCloseCampaignModal();
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsCampaign((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Formate les données campagne
     * @param {*} values Données du formulaire
     * @returns Données formatées
     */
    const formatDataCampaign = (values) => {
        const formData = new FormData();

        // Champs textes
        Object.entries(values).forEach(([key, value]) => {
            if (key !== 'picture' && value !== null) {
                formData.append(key, value);
            }
        });

        // Images (s'il y a une image à traiter)
        if (values.pictureAction === EnumAction.CREATE && values.picture) {
            formData.append('picture', values.picture);
        }

        return formData;
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <div className="campaigns-container">
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Liste des campagnes */}
                    <div className="gap-3 campaigns-grid">
                        {/* Ajout */}
                        <Button
                            className="d-flex flex-column align-items-center justify-content-center gap-3 campaigns-button"
                            onClick={() => openCloseCampaignModal(EnumAction.CREATE)}
                            disabled={isSubmitting}
                        >
                            <FaPlus size={30} />
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
                                    <span className="py-1 px-2 rounded campaigns-button-label">{campaign.name}</span>
                                    <div className="d-flex flex-row gap-2 campaigns-button-badges-wrapper">
                                        <span className="py-1 px-2 rounded campaigns-button-badge">{campaign.universe}</span>
                                        <span className="py-1 px-2 rounded campaigns-button-badge">
                                            {t(campaign.players === 1 ? 'campaign.countPlayer' : 'campaign.countPlayers', {
                                                count: campaign.players
                                            })}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                    </div>

                    {/* Modale de création de campagne */}
                    {formCampaign && modalOptionsCampaign.isOpen && (
                        <CampaignModal
                            formData={formCampaign}
                            modalOptions={modalOptionsCampaign}
                            setModalOptions={setModalOptionsCampaign}
                            onClose={openCloseCampaignModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default Campaigns;
