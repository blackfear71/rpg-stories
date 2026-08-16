import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, forkJoin, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';

import { CampaignList, SagaList } from '../../components/features';
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
    const [sagaCampaigns, setSagaCampaigns] = useState({
        sagaId: null,
        campaigns: [],
        isOpen: false
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
                    processSagasData(dataCampaigns.response.data, dataSagas.response.data);
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
     * Changement d'onglet
     * @param {*} tab Onglet sélectionné
     */
    const handleSelectTab = (tab) => {
        // Si on quitte l'onglet Sagas, on réinitialise la saga ouverte
        if (tab !== 'sagas') {
            setSagaCampaigns({ sagaId: null, campaigns: [], isOpen: false });
        }
    };

    /**
     * Réinitialisation à l'ouverture/fermeture de la modale campagne
     */
    useEffect(() => {
        // Réinitialisation du formulaire
        formCampaign.resetForm();

        // Quand on ouvre la modale depuis une saga, on initialise la saga dans le formulaire
        if (modalOptionsCampaign.isOpen && sagaCampaigns.isOpen && sagaCampaigns.sagaId) {
            formCampaign.setFieldValue('sagaId', sagaCampaigns.sagaId);
        }
    }, [modalOptionsCampaign.isOpen]);

    /**
     * Enrichit les données sagas avec les données campagnes
     * @param {*} dataCampaigns Données campagnes
     * @param {*} dataSagas Données sagas
     */
    const processSagasData = (dataCampaigns, dataSagas) => {
        // Ajout d'un groupe "Hors saga" en tête de liste si besoin
        let sagasData = dataCampaigns.some((c) => !c.sagaId) ? [{ id: null, name: t('campaign.noSaga') }, ...dataSagas] : dataSagas;

        // Ajout de l'image de la campagne la plus récente et calcul du nombre de campagnes par saga
        sagasData = sagasData.map((saga) => {
            const filteredCampaigns = dataCampaigns.filter((c) => c.sagaId === saga.id);

            return {
                ...saga,
                picture: filteredCampaigns.filter((c) => c.picture).sort((a, b) => b.id - a.id)[0]?.picture,
                campaignCount: filteredCampaigns.length
            };
        });

        setSagas(sagasData);
    };

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
        const sagasService = new SagasService();

        const subscriptionCampaigns = campaignsService.getCampaigns();
        const subscriptionSagas = sagasService.getSagas();

        campaignsService
            .createCampaign(body)
            .pipe(
                map((dataCampaign) => {
                    setMessage({ code: dataCampaign.response.message, type: dataCampaign.response.status });
                }),
                switchMap(() => forkJoin([subscriptionCampaigns, subscriptionSagas])),
                map(([dataCampaigns, dataSagas]) => {
                    const updatedCampaigns = dataCampaigns.response.data;

                    // Mise à jour des campagnes et sagas
                    setCampaigns(updatedCampaigns);
                    processSagasData(updatedCampaigns, dataSagas.response.data);

                    // Mise à jour des campagnes de la saga ouverte (si on est sur l'onglet des sagas)
                    if (sagaCampaigns?.isOpen) {
                        setSagaCampaigns({
                            ...sagaCampaigns,
                            campaigns: updatedCampaigns.filter((c) => c.sagaId === sagaCampaigns.sagaId)
                        });
                    }

                    // Fermeture de la modale de création de campagne
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

    /**
     * Ouverture/fermeture d'une saga
     * @param {*} sagaId Identifiant saga
     */
    const openCloseSaga = (sagaId) => {
        setSagaCampaigns((prev) => {
            // Clic sur la saga ouverte : on ferme et on réinitialise le state
            if (prev.sagaId === sagaId && prev.isOpen) {
                return { sagaId: null, campaigns: [], isOpen: false };
            }

            // Clic sur une saga différente : on ferme l'actuelle et on ouvre la nouvelle
            return {
                sagaId: sagaId,
                campaigns: campaigns.filter((c) => c.sagaId === sagaId),
                isOpen: true
            };
        });
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
                        onSelect={handleSelectTab}
                        id="campaigns-tabs"
                        className="p-1 mb-3 gap-1 justify-content-center page-tabs"
                    >
                        {/* Sagas */}
                        <Tab eventKey="sagas" title={t('campaign.sagas')}>
                            <SagaList
                                sagas={sagas}
                                sagaCampaigns={sagaCampaigns}
                                onOpenSaga={openCloseSaga}
                                onOpenSagaModal={openCloseSagaModal}
                                onOpenCampaingModal={openCloseCampaignModal}
                                isSubmitting={isSubmitting}
                            />
                        </Tab>

                        {/* Campagnes */}
                        <Tab eventKey="campaigns" title={t('campaign.campaigns')}>
                            <CampaignList campaigns={campaigns} onOpen={openCloseCampaignModal} isSubmitting={isSubmitting} />
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
