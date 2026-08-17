import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner } from 'react-bootstrap';

import { CampaignHeader, CampaignSaga, StoryList } from '../../components/features';
import { CampaignModal, ConfirmModal, DraftsModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';
import { useDrafts } from '../../utils/hooks/useDrafts';

import { EnumAction } from '../../enums';

import { CampaignsService, SagasService, StoriesService } from '../../api';

// Valeurs initiales des formulaires
const initialCampaignValues = {
    sagaId: null,
    name: '',
    universe: null,
    players: 0,
    picture: null,
    pictureAction: null
};
const initialStoryValues = {
    id: null,
    story: ''
};

/**
 * Page détail campagne
 */
const Campaign = () => {
    // Router
    const { id } = useParams();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, refreshAuth, setAuthMessage } = useAuth();
    const draftsState = useDrafts(id);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const newStoryRef = useRef(null);
    const storyRefs = useRef({});
    const [inputOptionsStory, setInputOptionsStory] = useState({
        action: null,
        storyId: 0,
        isOpen: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsCampaign, setModalOptionsCampaign] = useState({
        action: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: null,
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsDrafts, setModalOptionsDrafts] = useState({
        isOpen: false,
        message: null
    });

    // API states
    const [campaign, setCampaign] = useState();
    const [sagaCampaigns, setSagaCampaigns] = useState([]);
    const [sagas, setSagas] = useState([]);
    const [stories, setStories] = useState([]);

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
     * Schéma de validation Yup des histoires
     */
    const storyValidationSchema = useMemo(() => {
        return Yup.object({
            story: Yup.string().required('errors.invalidStory')
        });
    }, [inputOptionsStory.storyId]);

    /**
     * Formik campagne
     */
    const formCampaign = useFormik({
        initialValues: initialCampaignValues,
        validationSchema: campaignValidationSchema,
        onSubmit: (values) => handleSubmitCampaign(values)
    });

    /**
     * Formik histoire
     */
    const formStory = useFormik({
        initialValues: initialStoryValues,
        validationSchema: storyValidationSchema,
        onSubmit: (values) => handleSubmitStory(values)
    });

    /**
     * Lancement initial de la page (à chaque changement d'id)
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification
        refreshAuth(false);

        // Récupération de la campagne et de ses histoires
        const campaignsService = new CampaignsService();
        const sagasService = new SagasService();
        const storiesService = new StoriesService();

        const subscriptionCampaign = campaignsService.getCampaign(id);
        const subscriptionSagas = sagasService.getSagas();
        const subscriptionStories = storiesService.getCampaignStories(id);

        combineLatest([subscriptionCampaign, subscriptionSagas, subscriptionStories])
            .pipe(
                map(([dataCampaign, dataSagas, dataStories]) => {
                    setCampaign(dataCampaign.response.data);
                    setSagas(dataSagas.response.data);
                    setStories(dataStories.response.data);

                    return dataCampaign.response.data;
                }),
                switchMap((campaignData) => (campaignData?.sagaId ? campaignsService.getSagaCampaigns(campaignData.sagaId) : of(null))),
                map((dataSagaCampaigns) => {
                    // Mise à jour des données de la saga liée à la campagne
                    if (dataSagaCampaigns?.response?.data) {
                        setSagaCampaigns(dataSagaCampaigns.response.data);
                    } else {
                        setSagaCampaigns([]);
                    }
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
    }, [id]);

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
        // Message venant du AuthContext (rafraîchissement de la connexion)
        if (authMessage) {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Mise à jour du formulaire de la campagne aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsCampaign.isOpen && campaign) {
            formCampaign.setValues({
                sagaId: campaign.sagaId,
                name: campaign.name,
                universe: campaign.universe,
                players: campaign.players,
                picture: campaign.picture,
                pictureAction: null
            });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsCampaign.isOpen) {
            formCampaign.resetForm();
        }
    }, [modalOptionsCampaign.isOpen, campaign]);

    /**
     * Mise à jour du formulaire de l'histoire aux changements de sa saisie
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la saisie en modification
        if (inputOptionsStory.isOpen && inputOptionsStory.storyId && inputOptionsStory.action === EnumAction.UPDATE) {
            const currentStory = stories.find((g) => g.id === inputOptionsStory.storyId);

            if (currentStory) {
                // Initialisation du formulaire
                formStory.setValues({
                    id: currentStory.id,
                    story: currentStory.story
                });

                // Scroll vers la saisie à l'ouverture en modification
                requestAnimationFrame(() => {
                    storyRefs.current[currentStory.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        }

        // Scroll vers la saisie à l'ouverture en création
        if (inputOptionsStory.isOpen && inputOptionsStory.action === EnumAction.CREATE) {
            requestAnimationFrame(() => {
                newStoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        // Réinitialisation à la fermeture de la modale ou à l'ouverture de la saisie en création
        if (!inputOptionsStory.isOpen || inputOptionsStory.action === EnumAction.CREATE) {
            formStory.resetForm();
        }
    }, [inputOptionsStory.isOpen, inputOptionsStory.storyId, inputOptionsStory.action]);

    /**
     * Ouverture/fermeture des brouillons
     */
    const openCloseDraftsModal = () => {
        // Ouverture ou fermeture
        setModalOptionsDrafts((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Ouverture/fermeture de la modale de modification de campagne
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
     * Modification de la campagne
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
            .updateCampaign(campaign.id, body)
            .pipe(
                map((dataCampaign) => {
                    setMessage({ code: dataCampaign.response.message, type: dataCampaign.response.status });
                }),
                switchMap(() => campaignsService.getCampaign(campaign.id)),
                map((newDataCampaign) => {
                    // Mise à jour des données de la campagne
                    setCampaign(newDataCampaign.response.data);

                    return newDataCampaign.response.data;
                }),
                switchMap((campaignData) => (campaignData?.sagaId ? campaignsService.getSagaCampaigns(campaignData.sagaId) : of(null))),
                map((dataSagaCampaigns) => {
                    // Mise à jour des données de la saga liée à la campagne
                    if (dataSagaCampaigns?.response?.data) {
                        setSagaCampaigns(dataSagaCampaigns.response.data);
                    } else {
                        setSagaCampaigns([]);
                    }

                    // Fermeture de la modale de modification de campagne
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
     * Ouverture/fermeture de la saisie d'histoire
     * @param {*} action Action à réaliser
     * @param {*} storyId Identifiant histoire
     * @param {*} draftId Identifiant brouillon
     */
    const openCloseStoryInput = (action = null, storyId = null, draftId = null) => {
        // Ouverture ou fermeture
        setInputOptionsStory((prev) => ({
            ...prev,
            action: action,
            storyId: storyId,
            draftId: draftId,
            isOpen: !prev.isOpen
        }));
    };

    /**
     * Création ou modification d'une histoire
     * @param {*} values Données du formulaire
     */
    const handleSubmitStory = (values) => {
        setMessage(null);

        const storiesService = new StoriesService();

        let subscriptionStory = null;

        switch (inputOptionsStory?.action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);

                subscriptionStory = storiesService.createStory(campaign.id, { story: values.story });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);

                subscriptionStory = storiesService.updateStory(values.id, { story: values.story });
                break;
        }

        subscriptionStory
            ?.pipe(
                map((dataStory) => {
                    setMessage({ code: dataStory.response.message, type: dataStory.response.status });
                }),
                switchMap(() => storiesService.getCampaignStories(campaign.id)),
                map((dataStories) => {
                    openCloseStoryInput();
                    setStories(dataStories.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouvre la modale de suppression de campagne
     */
    const handleConfirmDeleteCampaign = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('campaign.confirmDeleteCampaign', { name: campaign.name }),
            action: 'deleteCampaign',
            data: null
        });
    };

    /**
     * Ouvre la modale de suppression d'histoire
     * @param {*} storyId Identifiant histoire
     * @param {*} date Date histoire
     */
    const handleConfirmDeleteStory = (storyId, date) => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('campaign.deleteStory', { date: date, name: campaign.name }),
            action: 'deleteStory',
            data: storyId
        });
    };

    /**
     * Ouverture/fermeture de la modale de confirmation
     * @param {*} confirmOptions Données modale de confirmation
     */
    const openCloseConfirmModal = (confirmOptions) => {
        // Ouverture ou fermeture
        if (confirmOptions) {
            setModalOptionsConfirm({
                content: confirmOptions.content,
                action: confirmOptions.action,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: null,
                data: null,
                isOpen: false,
                message: null
            });
        }
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm?.action) {
            case 'deleteCampaign':
                return handleDeleteCampaign();
            case 'deleteDrafts':
                return handleDeleteDrafts();
            case 'deleteStory':
                return handleDeleteStory(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression de la campagne
     */
    const handleDeleteCampaign = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const campaignsService = new CampaignsService();

        campaignsService
            .deleteCampaign(campaign.id)
            .pipe(
                map((dataCampaign) => {
                    // Fermeture modale de confirmation
                    openCloseConfirmModal();

                    // Redirection avec message
                    navigate('/campaigns', {
                        state: {
                            navMessage: { code: dataCampaign.response.message, type: dataCampaign.response.status }
                        }
                    });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
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
     * Suppression d'un brouillon
     */
    const handleDeleteDrafts = async () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        try {
            const result = await draftsState.deleteDrafts();
            openCloseConfirmModal();
            setMessage(result);
        } catch (err) {
            setModalOptionsConfirm((prev) => ({
                ...prev,
                message: err
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Suppression d'une histoire
     * @param {*} storyId Identifiant histoire
     */
    const handleDeleteStory = (storyId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const storiesService = new StoriesService();

        storiesService
            .deleteStory(storyId)
            .pipe(
                map((dataStory) => {
                    setMessage({ code: dataStory.response.message, type: dataStory.response.status });
                }),
                switchMap(() => storiesService.getCampaignStories(campaign.id)),
                map((dataStories) => {
                    openCloseConfirmModal();
                    setStories(dataStories.response.data);
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
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
     * Enregistre / efface la ref DOM d'une histoire
     */
    const registerStoryRef = (storyId, node) => {
        if (node) {
            storyRefs.current[storyId] = node;
        } else {
            delete storyRefs.current[storyId];
        }
    };

    /**
     * Navigue vers l'histoire précédente / suivante en scrollant
     * @param {*} direction 'previous' | 'next'
     * @param {*} currentIndex Index de l'histoire courante
     */
    const handleNavigateStory = (direction, currentIndex) => {
        const targetIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
        const targetStory = stories[targetIndex];

        targetStory && storyRefs.current[targetStory.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Campagne */}
                    {campaign && (
                        <div className="d-flex flex-column gap-3">
                            {/* Entete */}
                            <CampaignHeader
                                campaign={campaign}
                                storyCount={stories?.length ?? 0}
                                draftsState={draftsState}
                                inputOptions={inputOptionsStory}
                                onOpenStoryInput={openCloseStoryInput}
                                onOpenDraftsModal={openCloseDraftsModal}
                                onOpenCampaignModal={openCloseCampaignModal}
                                onConfirm={handleConfirmDeleteCampaign}
                                isSubmitting={isSubmitting}
                            />

                            {/* Saga */}
                            {sagas && sagaCampaigns && sagaCampaigns.length > 0 && (
                                <CampaignSaga
                                    campaignId={campaign.id}
                                    saga={sagas.find((s) => s.id === campaign.sagaId)}
                                    sagaCampaigns={sagaCampaigns}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {/* Timeline */}
                            <StoryList
                                stories={stories}
                                inputOptions={inputOptionsStory}
                                newStoryRef={newStoryRef}
                                campaignId={id}
                                formData={formStory}
                                draftsState={draftsState}
                                onConfirm={handleConfirmDeleteStory}
                                onOpenClose={openCloseStoryInput}
                                onNavigate={handleNavigateStory}
                                registerRef={registerStoryRef}
                                setMessage={setMessage}
                                isSubmitting={isSubmitting}
                            />

                            {/* Modale de modification de campagne */}
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

                            {/* Modale des brouillons */}
                            {modalOptionsDrafts.isOpen && (
                                <DraftsModal
                                    draftsState={draftsState}
                                    modalOptions={modalOptionsDrafts}
                                    setModalOptions={setModalOptionsDrafts}
                                    onClose={openCloseDraftsModal}
                                    onConfirm={openCloseConfirmModal}
                                    onOpenInput={openCloseStoryInput}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {/* Modale de confirmation */}
                            {modalOptionsConfirm.isOpen && (
                                <ConfirmModal
                                    modalOptions={modalOptionsConfirm}
                                    setModalOptions={setModalOptionsConfirm}
                                    onClose={openCloseConfirmModal}
                                    onConfirmAction={handleConfirmAction}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Campaign;
