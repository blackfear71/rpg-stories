import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner } from 'react-bootstrap';

import { CampaignHeader, Story, StoryEntry } from '../../components/features';
import { CampaignModal, ConfirmModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction } from '../../enums';

import { CampaignsService, StoriesService } from '../../api';

import './Campaign.css';

// Valeurs initiales des formulaires
const initialCampaignValues = {
    name: '',
    universe: '',
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
    const { auth, refreshAuth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
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

    // API states
    const [campaign, setCampaign] = useState();
    const [stories, setStories] = useState([]);

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
     * Schéma de validation Yup des histoires
     */
    const storyValidationSchema = useMemo(() => {
        return Yup.object({
            story: Yup.string().required('errors.invalidStory') // TODO : trad
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
        const storiesService = new StoriesService();

        const subscriptionCampaign = campaignsService.getCampaign(id);
        const subscriptionStories = storiesService.getCampaignStories(id);

        combineLatest([subscriptionCampaign, subscriptionStories])
            .pipe(
                map(([dataCampaign, dataStories]) => {
                    setCampaign(dataCampaign.response.data);
                    setStories(dataStories.response.data);
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
     * Mise à jour du formulaire de la campagne aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsCampaign.isOpen && campaign) {
            formCampaign.setValues({
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
        if (inputOptionsStory.isOpen && inputOptionsStory.action === EnumAction.UPDATE && inputOptionsStory.storyId) {
            const currentStory = stories.find((g) => g.id === inputOptionsStory.storyId);

            currentStory &&
                formStory.setValues({
                    id: currentStory.id,
                    story: currentStory.story
                });
        }

        // Réinitialisation à la fermeture de la modale ou à l'ouverture de la saisie en création
        if (!inputOptionsStory.isOpen || inputOptionsStory.action === EnumAction.CREATE) {
            formStory.resetForm();
        }
    }, [inputOptionsStory.isOpen, inputOptionsStory.storyId]);

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
                    openCloseCampaignModal();
                    setCampaign(newDataCampaign.response.data);
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

    /**
     * Ouverture/fermeture de la saisie d'histoire
     * @param {*} action Action à réaliser
     * @param {*} storyId Identifiant histoire
     */
    const openCloseStoryInput = (action = null, storyId = null) => {
        // Ouverture ou fermeture
        setInputOptionsStory((prev) => ({
            ...prev,
            action: action,
            storyId: storyId,
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
                    navigate('/', {
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

    return (
        <div>
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
                                inputOptions={inputOptionsStory}
                                onOpenInput={openCloseStoryInput}
                                onOpenModal={openCloseCampaignModal}
                                onConfirm={handleConfirmDeleteCampaign}
                            />

                            {/* Nouvelle histoire */}
                            {inputOptionsStory?.isOpen && inputOptionsStory?.action === EnumAction.CREATE && (
                                <StoryEntry
                                    formData={formStory}
                                    inputOptions={inputOptionsStory}
                                    onOpenClose={openCloseStoryInput}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {/* Histoires */}
                            {stories && stories.length > 0
                                ? stories.map((story) => (
                                      <Story
                                          key={story.id}
                                          story={story}
                                          formData={formStory}
                                          inputOptions={inputOptionsStory}
                                          onConfirm={handleConfirmDeleteStory}
                                          onOpenClose={openCloseStoryInput}
                                          isSubmitting={isSubmitting}
                                      />
                                  ))
                                : !inputOptionsStory?.isOpen && (
                                      <div className="p-5 rounded campaign-stories-empty">{t('campaign.emptyStories')}</div>
                                  )}

                            {/* Modale de modification de campagne */}
                            {formCampaign && modalOptionsCampaign.isOpen && (
                                <CampaignModal
                                    formData={formCampaign}
                                    modalOptions={modalOptionsCampaign}
                                    setModalOptions={setModalOptionsCampaign}
                                    onClose={openCloseCampaignModal}
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
        </div>
    );
};

export default Campaign;
