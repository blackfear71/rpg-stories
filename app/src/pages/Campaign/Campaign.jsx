import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, forkJoin, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';

import { CampaignHeader, CampaignSaga, Character, StoryList } from '../../components/features';
import { CampaignModal, CharacterModal, ConfirmModal, DraftsModal, ImportCharacterModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';
import { useDrafts } from '../../utils/hooks/useDrafts';

import { EnumAction, EnumTab } from '../../enums';

import { CampaignsService, CharactersService, SagasService, StoriesService } from '../../api';

// Valeurs initiales des formulaires
const initialCampaignValues = {
    sagaId: null,
    name: '',
    universe: null,
    players: 0,
    picture: null,
    pictureAction: null
};
const initialCharacterValues = {
    id: null,
    name: '',
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
    const { auth, authMessage, refreshAuth, setAuthMessage, skipAutoRedirectRef } = useAuth();
    const draftsState = useDrafts(id);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const newStoryRef = useRef(null);
    const storyRefs = useRef({});
    const [activeTab, setActiveTab] = useState(EnumTab.CAMPAIGN);
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
    const [modalOptionsCharacter, setModalOptionsCharacter] = useState({
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
    const [modalOptionsImportCharacter, setModalOptionsImportCharacter] = useState({
        action: null,
        isOpen: false,
        message: null
    });

    // API states
    const [campaign, setCampaign] = useState();
    const [character, setCharacter] = useState();
    const [characters, setCharacters] = useState();
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
     * Schéma de validation Yup du personnage
     */
    const characterValidationSchema = useMemo(() => {
        return Yup.object({
            name: Yup.string().required('errors.invalidName'),
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
     * Formik personnage
     */
    const formCharacter = useFormik({
        initialValues: initialCharacterValues,
        validationSchema: characterValidationSchema,
        onSubmit: (values) => handleSubmitCharacter(values)
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

        // Récupération des données de la campagne
        const campaignsService = new CampaignsService();
        const charactersService = new CharactersService();
        const sagasService = new SagasService();
        const storiesService = new StoriesService();

        const subscriptionCampaign = campaignsService.getCampaign(id);
        const subscriptionCharacter = charactersService.getCharacter(id);
        const subscriptionCharacters = charactersService.getCharacters();
        const subscriptionSagaCampaigns = campaignsService.getSagaCampaigns(id);
        const subscriptionSagas = sagasService.getSagas();
        const subscriptionStories = storiesService.getCampaignStories(id);

        combineLatest([
            subscriptionCampaign,
            subscriptionCharacter,
            subscriptionCharacters,
            subscriptionSagaCampaigns,
            subscriptionSagas,
            subscriptionStories
        ])
            .pipe(
                map(([dataCampaign, dataCharacter, dataCharacters, dataSagaCampaigns, dataSagas, dataStories]) => {
                    setCampaign(dataCampaign.response.data);
                    setCharacter(dataCharacter.response.data);
                    setCharacters(dataCharacters.response.data);
                    setSagaCampaigns(dataSagaCampaigns.response.data);
                    setSagas(dataSagas.response.data);
                    setStories(dataStories.response.data);

                    // Affichage des alertes si besoin
                    // TODO : faire un enum des status
                    // TODO : à faire aussi sur campaigns pour les images des campagnes
                    if (dataCampaign?.response?.status === 'warning') {
                        setMessage({ code: dataCampaign?.response?.message, type: dataCampaign?.response?.status });
                    } else if (dataCharacter?.response?.status === 'warning') {
                        setMessage({ code: dataCharacter?.response?.message, type: dataCharacter?.response?.status });
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
        // Redirection vers l'accueil si non connecté (en évitant la navigation concurrente à la déconnexion)
        if (!auth?.isLoggedIn) {
            if (skipAutoRedirectRef.current) {
                skipAutoRedirectRef.current = false;
            } else {
                navigate('/');
            }
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
     * Mise à jour du formulaire du personnage aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale en modification
        if (modalOptionsCharacter.isOpen && modalOptionsCharacter.action === EnumAction.UPDATE && campaign && character) {
            formCharacter.setValues({
                id: character.id,
                name: character.name,
                picture: character.picture,
                pictureAction: null
            });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsCharacter.isOpen) {
            formCharacter.resetForm();
        }
    }, [modalOptionsCharacter.isOpen, campaign, character]);

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
        const body = formatBody(values);

        const campaignsService = new CampaignsService();

        const subscriptionCampaign = campaignsService.getCampaign(campaign?.id);
        const subscriptionSagaCampaigns = campaignsService.getSagaCampaigns(campaign?.id);

        campaignsService
            .updateCampaign(campaign?.id, body)
            .pipe(
                map((dataCampaign) => {
                    setMessage({ code: dataCampaign.response.message, type: dataCampaign.response.status });
                }),
                switchMap(() => forkJoin([subscriptionCampaign, subscriptionSagaCampaigns])),
                map(([newDataCampaign, dataSagaCampaigns]) => {
                    // Mise à jour des données de la campagne
                    setCampaign(newDataCampaign.response.data);
                    setSagaCampaigns(dataSagaCampaigns.response.data);

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

                subscriptionStory = storiesService.createStory(campaign?.id, { story: values.story });
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
                switchMap(() => storiesService.getCampaignStories(campaign?.id)),
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
            content: t('campaign.confirmDeleteCampaign', { name: campaign?.name }),
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
            content: t('campaign.deleteStory', { date: date, name: campaign?.name }),
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
            case 'deleteCharacter':
                return handleDeleteCharacter();
            case 'deleteDrafts':
                return handleDeleteDrafts();
            case 'deleteStory':
                return handleDeleteStory(modalOptionsConfirm.data);
            case 'detachCharacter':
                return handleDetachCharacter();
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
            .deleteCampaign(campaign?.id)
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
     * Suppression du personnage
     */
    const handleDeleteCharacter = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const charactersService = new CharactersService();

        charactersService
            .deleteCharacter(character?.id)
            .pipe(
                map((dataCharacter) => {
                    setMessage({ code: dataCharacter.response.message, type: dataCharacter.response.status });
                }),
                switchMap(() => charactersService.getCharacters()),
                map((dataCharacters) => {
                    // Mise à jour des données des personnages
                    setCharacter();
                    setCharacters(dataCharacters.response.data);

                    // Fermeture de la modale de confirmation
                    openCloseConfirmModal();
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
                switchMap(() => storiesService.getCampaignStories(campaign?.id)),
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
     * Détachement du personnage
     */
    const handleDetachCharacter = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const charactersService = new CharactersService();

        charactersService
            .detachCharacter(campaign?.id)
            .pipe(
                map((dataCharacter) => {
                    setMessage({ code: dataCharacter.response.message, type: dataCharacter.response.status });
                    openCloseConfirmModal();
                    setCharacter();
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

    /**
     * Ouverture/fermeture de la modale de création / modification de personnage
     * @param {*} action Action à réaliser
     */
    const openCloseCharacterModal = (action = null) => {
        // Ouverture ou fermeture
        setModalOptionsCharacter((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création / modification d'un personnage
     * @param {*} values Données du formulaire
     */
    const handleSubmitCharacter = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsCharacter((prev) => ({ ...prev, message: null }));

        // Formatage des données
        const body = formatBody(values);

        const charactersService = new CharactersService();

        let subscriptionCharacter = null;
        const subscriptionCampaignCharacter = charactersService.getCharacter(campaign?.id);
        const subscriptionCharacters = charactersService.getCharacters();

        switch (modalOptionsCharacter?.action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);

                subscriptionCharacter = charactersService.createCharacter(campaign?.id, body);
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);

                subscriptionCharacter = charactersService.updateCharacter(values.id, body);
                break;
        }

        subscriptionCharacter
            ?.pipe(
                map((dataCharacter) => {
                    setMessage({ code: dataCharacter.response.message, type: dataCharacter.response.status });
                }),
                switchMap(() => forkJoin([subscriptionCampaignCharacter, subscriptionCharacters])),
                map(([dataCampaignCharacter, dataCharacters]) => {
                    // Mise à jour des données des personnages
                    setCharacter(dataCampaignCharacter.response.data);
                    setCharacters(dataCharacters.response.data);

                    // Fermeture de la modale de création / modification de personnage
                    openCloseCharacterModal();
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsCharacter((prev) => ({
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
     * Ouverture/fermeture de la modale d'import de personnage
     * @param {*} action Action à réaliser
     */
    const openCloseImportCharacterModal = (action = null) => {
        // Ouverture ou fermeture
        setModalOptionsImportCharacter((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Import d'un personnage
     * @param {*} characterId Identifiant personnage
     */
    const handleImportCharacter = (characterId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsImportCharacter((prev) => ({ ...prev, message: null }));

        const charactersService = new CharactersService();

        charactersService
            .importCharacter({ campaignId: campaign?.id, characterId: characterId })
            .pipe(
                map((dataCharacter) => {
                    setMessage({ code: dataCharacter.response.message, type: dataCharacter.response.status });
                }),
                switchMap(() => charactersService.getCharacter(campaign?.id)),
                map((dataCampaignCharacter) => {
                    openCloseImportCharacterModal();
                    setCharacter(dataCampaignCharacter.response.data);
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsImportCharacter((prev) => ({
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
     * Ouvre la modale de détachement de personnage
     */
    const handleConfirmDetachCharacter = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('character.confirmDetachCharacter', { name: character?.name }),
            action: 'detachCharacter',
            data: null
        });
    };

    /**
     * Ouvre la modale de suppression de personnage
     */
    const handleConfirmDeleteCharacter = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('character.confirmDeleteCharacter', { name: character?.name }),
            action: 'deleteCharacter',
            data: null
        });
    };

    /**
     * Formate les données body
     * @param {*} values Données du formulaire
     * @returns Données formatées
     */
    const formatBody = (values) => {
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
                                activeTab={activeTab}
                                campaign={campaign}
                                storyCount={stories?.length ?? 0}
                                draftsState={draftsState}
                                hasCharacter={!!character}
                                inputOptions={inputOptionsStory}
                                onOpenStoryInput={openCloseStoryInput}
                                onOpenDraftsModal={openCloseDraftsModal}
                                onOpenCampaignModal={openCloseCampaignModal}
                                onOpenCharacterModal={openCloseCharacterModal}
                                onOpenImportModal={openCloseImportCharacterModal}
                                onConfirm={handleConfirmDeleteCampaign}
                                isSubmitting={isSubmitting}
                            />

                            {/* Onglets */}
                            <Tabs
                                variant="pills"
                                defaultActiveKey={EnumTab.CAMPAIGN}
                                onSelect={(key) => setActiveTab(key)}
                                id="campaign-tabs"
                                className="p-1 gap-1 page-tabs"
                            >
                                {/* Campagne */}
                                <Tab eventKey={EnumTab.CAMPAIGN} title={t('campaign.campaign')}>
                                    <div className="d-flex flex-column gap-3">
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
                                    </div>
                                </Tab>

                                {/* Personnage */}
                                <Tab eventKey={EnumTab.CHARACTER} title={t('campaign.character')}>
                                    <Character
                                        character={character}
                                        onOpenCharacterModal={openCloseCharacterModal}
                                        onConfirmDetach={handleConfirmDetachCharacter}
                                        onConfirmDelete={handleConfirmDeleteCharacter}
                                        isSubmitting={isSubmitting}
                                    />
                                </Tab>
                            </Tabs>

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

                            {/* Modale de création / modification de personnage */}
                            {formCharacter && modalOptionsCharacter.isOpen && (
                                <CharacterModal
                                    formData={formCharacter}
                                    modalOptions={modalOptionsCharacter}
                                    setModalOptions={setModalOptionsCharacter}
                                    onClose={openCloseCharacterModal}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {/* Modale d'import de personnage */}
                            {modalOptionsImportCharacter.isOpen && (
                                <ImportCharacterModal
                                    characters={characters}
                                    modalOptions={modalOptionsImportCharacter}
                                    setModalOptions={setModalOptionsImportCharacter}
                                    onSelectCharacter={handleImportCharacter}
                                    onClose={openCloseImportCharacterModal}
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
