import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';

import { CampaignsList, SagasList } from '../../components/features';
import { CampaignModal, SagaModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction } from '../../enums';

import { CampaignsService, SagasService } from '../../api';

import './Campaigns.css';

// Valeurs initiales des formulaires
const initialCampaignValues = {
    sagaId: null,
    name: '',
    universe: null,
    players: 0,
    picture: null,
    pictureAction: null
};
const initialSagaValues = {
    name: ''
};

/**
 * Page des campagnes
 */
const Campaigns = () => {
    // Router
    const location = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, refreshAuth, setAuthMessage, skipAutoRedirectRef } = useAuth();

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
    const [modalOptionsSaga, setModalOptionsSaga] = useState({
        action: null,
        isOpen: false,
        message: null
    });

    // API states
    const [campaigns, setCampaigns] = useState([]);
    const [sagas, setSagas] = useState([]);

    /**
     * Schéma de validation Yup de la campagne
     */
    const campaignValidationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('errors.invalidName'),
            players: Yup.number()
                .integer('errors.invalidPlayers')
                .min(1, 'errors.invalidPlayers')
                .typeError('errors.invalidPlayers')
                .required('errors.invalidPlayers'),
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
     * Schéma de validation Yup de la saga
     */
    const sagaValidationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('errors.invalidName')
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
     * Formik saga
     */
    const formSaga = useFormik({
        initialValues: initialSagaValues,
        validationSchema: sagaValidationSchema,
        onSubmit: (values) => handleSubmitSaga(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification
        refreshAuth(false);

        // Récupération des sagas et des campagnes
        const campaignsService = new CampaignsService();
        const sagasService = new SagasService();

        const subscriptionCampaign = campaignsService.getCampaigns();
        const subscriptionSagas = sagasService.getSagas();

        combineLatest([subscriptionCampaign, subscriptionSagas])
            .pipe(
                map(([dataCampaigns, dataSagas]) => {
                    setCampaigns(dataCampaigns.response.data);
                    setSagas(dataSagas.response.data);
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
            // Redirection si non connecté (en évitant la navigation concurrente à la déconnexion)
            if (skipAutoRedirectRef.current) {
                skipAutoRedirectRef.current = false;
            } else {
                navigate('/');
            }
        }
    }, [auth]);

    /**
     * Si un message d'authentification ou de navigation est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (rafraîchissement de la connexion)
        if (authMessage) {
            setMessage(authMessage);
            setAuthMessage(null);
        }

        // Message venant du navigate() (connexion ou suppression campagne)
        if (location.state?.navMessage) {
            setMessage(location.state.navMessage);

            // Nettoyage du state React Router
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [authMessage, setAuthMessage, location.state, location.pathname, navigate]);

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
            if (key !== 'picture' && value) {
                formData.append(key, value);
            }
        });

        // Images (s'il y a une image à traiter)
        if (values.pictureAction === EnumAction.CREATE && values.picture) {
            formData.append('picture', values.picture);
        }

        return formData;
    };

    /**
     * Ouverture/fermeture de la modale de création de saga
     * @param {*} action Action à réaliser
     */
    const openCloseSagaModal = (action = null) => {
        // Ouverture ou fermeture
        setModalOptionsSaga((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création saga
     * @param {*} values Données du formulaire
     */
    const handleSubmitSaga = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsSaga((prev) => ({ ...prev, message: null }));

        // Formatage des données
        const body = formatDataSaga(values);

        const sagasService = new SagasService();

        sagasService
            .createSaga(body)
            .pipe(
                map((dataSaga) => {
                    setMessage({ code: dataSaga.response.message, type: dataSaga.response.status });
                }),
                switchMap(() => sagasService.getSagas()),
                map((dataSagas) => {
                    setSagas(dataSagas.response.data);
                    openCloseSagaModal();
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsSaga((prev) => ({
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
     * Formate les données saga
     * @param {*} values Données du formulaire
     * @returns Données formatées
     */
    const formatDataSaga = (values) => {
        const formData = new FormData();

        // Champs textes
        Object.entries(values).forEach(([key, value]) => {
            if (key !== 'picture' && value) {
                formData.append(key, value);
            }
        });

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

                    {/* Onglets */}
                    <Tabs
                        variant="pills"
                        defaultActiveKey="sagas"
                        id="campaigns-tabs"
                        className="p-1 mb-3 gap-1 justify-content-center page-tabs"
                    >
                        {/* Sagas */}
                        <Tab eventKey="sagas" title={t('campaign.sagas')}>
                            <SagasList sagas={sagas} onOpen={openCloseSagaModal} isSubmitting={isSubmitting} />
                        </Tab>

                        {/* Campagnes */}
                        <Tab eventKey="campaigns" title={t('campaign.campaigns')}>
                            <CampaignsList campaigns={campaigns} onOpen={openCloseCampaignModal} isSubmitting={isSubmitting} />
                        </Tab>
                    </Tabs>

                    {/* Modale de création de campagne */}
                    {formCampaign && modalOptionsCampaign.isOpen && (
                        <CampaignModal
                            sagas={sagas}
                            formData={formCampaign}
                            modalOptions={modalOptionsCampaign}
                            setModalOptions={setModalOptionsCampaign}
                            onClose={openCloseCampaignModal}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de création de saga */}
                    {formSaga && modalOptionsSaga.isOpen && (
                        <SagaModal
                            formData={formSaga}
                            modalOptions={modalOptionsSaga}
                            setModalOptions={setModalOptionsSaga}
                            onClose={openCloseSagaModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default Campaigns;
