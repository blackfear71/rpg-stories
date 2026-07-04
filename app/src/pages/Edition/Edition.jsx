import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { forkJoin, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Image, Spinner, Tab, Tabs } from 'react-bootstrap';
import { FaComputer } from 'react-icons/fa6';

import { EditionAbout, EditionGifts, EditionPlayers } from '../../components/features';
import { ConfirmModal, EditionModal, GiftModal, PlayerModal, RewardModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';
import { useSse } from '../../utils/context/SseContext';
import { getDayFromDate, getLocalizedTime } from '../../utils/helpers/dateHelper';

import { EnumAction, EnumUserRole } from '../../enums';

import { EditionsService, GiftsService, PlayersService, RewardsService } from '../../api';

import './Edition.css';

// Valeurs initiales des formulaires
const initialEditionValues = {
    location: '',
    startDate: '',
    startTime: '',
    endTime: '',
    picture: null,
    pictureAction: null,
    theme: '',
    challenge: ''
};
const initialGiftValues = {
    id: null,
    name: '',
    value: '',
    quantity: ''
};
const initialPlayerValues = {
    id: null,
    name: '',
    points: 0,
    giveaway: 0,
    giveawayPlayerId: ''
};
const initialRewardValues = {
    giftId: '',
    playerId: null
};

/**
 * Page détail édition
 */
const Edition = () => {
    // Router
    const { id } = useParams();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage } = useAuth();
    const { events } = useSse();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: null,
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsEdition, setModalOptionsEdition] = useState({
        action: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsGift, setModalOptionsGift] = useState({
        action: null,
        giftId: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsPlayer, setModalOptionsPlayer] = useState({
        action: null,
        playerId: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsReward, setModalOptionsReward] = useState({
        playerId: null,
        isOpen: false,
        message: null
    });

    // API states
    const [edition, setEdition] = useState();
    const [gifts, setGifts] = useState([]);
    const [players, setPlayers] = useState([]);

    // Constantes
    const rights = {
        isUser: auth.isLoggedIn && auth.level === EnumUserRole.USER,
        isAdmin: auth.isLoggedIn && auth.level === EnumUserRole.ADMIN,
        isSuperAdmin: auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN,
        isAdminOrSuperAdminOnEdition:
            auth.isLoggedIn &&
            ((auth.level === EnumUserRole.ADMIN && new Date() <= new Date(edition?.endDate)) || auth.level >= EnumUserRole.SUPERADMIN)
    };

    /**
     * Schéma de validation Yup de l'édition
     */
    const editionValidationSchema = useMemo(() => {
        return Yup.object({
            startDate: Yup.string().required('errors.invalidStartDate'),
            startTime: Yup.string().required('errors.invalidStartTime'),
            endTime: Yup.string().required('errors.invalidEndTime'),
            location: Yup.string().required('errors.invalidLocation'),
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
     * Schéma de validation Yup des cadeaux
     */
    const giftValidationSchema = useMemo(() => {
        const currentGift = gifts.find((g) => g.id === modalOptionsGift.giftId);

        return Yup.object({
            name: Yup.string().required('errors.invalidName'),
            value: Yup.number()
                .typeError('errors.invalidValue')
                .required('errors.invalidValue')
                .integer('errors.invalidValue')
                .positive('errors.invalidValue'),
            quantity: Yup.number()
                .typeError('errors.invalidQuantity')
                .required('errors.invalidQuantity')
                .min(0, 'errors.invalidQuantity')
                .test('gift-reward-count', 'errors.quantityAttribution', (value) => !currentGift || value >= currentGift.rewardCount)
        });
    }, [modalOptionsGift.giftId, gifts]);

    /**
     * Schéma de validation Yup des participants
     */
    const playerValidationSchema = useMemo(() => {
        const currentPlayer = players.find((p) => p.id === modalOptionsPlayer.playerId);

        return Yup.object({
            name: Yup.string().required('errors.invalidName'),
            points: Yup.number()
                .typeError('errors.invalidPoints')
                .required('errors.invalidPoints')
                .min(
                    !rights.isSuperAdmin || modalOptionsPlayer.action === EnumAction.CREATE ? 0 : -currentPlayer?.points,
                    'errors.invalidPoints'
                ),
            ...(modalOptionsPlayer.action === EnumAction.UPDATE && {
                giveaway: Yup.number()
                    .nullable()
                    // Don > 0 si un joueur est sélectionné
                    .test('giveaway-pair', 'errors.invalidGiveaway', function (value) {
                        const { giveawayPlayerId } = this.parent;
                        return !giveawayPlayerId || value > 0;
                    })
                    // Points restants
                    .test('giveaway-remaining', 'errors.invalidGiveawayRemaining', function (value) {
                        const { points } = this.parent;
                        const delta = parseInt(points, 10);
                        const giveaway = parseInt(value, 10) || 0;
                        return currentPlayer.points + delta - giveaway >= 0;
                    }),
                giveawayPlayerId: Yup.mixed()
                    .nullable()
                    // Joueur sélectionné si don > 0
                    .test('giveawayPlayerId-pair', 'errors.invalidGiveawayPlayer', function (value) {
                        const { giveaway } = this.parent;
                        return !(giveaway > 0) || !!value;
                    })
            })
        });
    }, [modalOptionsPlayer.playerId, modalOptionsPlayer.action, players, auth]);

    /**
     * Schéma de validation Yup des récompenses
     */
    const rewardValidationSchema = useMemo(() => {
        const currentPlayer = players.find((p) => p.id === modalOptionsReward.playerId);

        return Yup.object({
            giftId: Yup.mixed()
                .required('errors.invalidGift')
                // Nombre de points suffisant
                .test('gift-points', 'errors.invalidGiftPoints', (value) =>
                    gifts.some((g) => g.id === value && g.remainingQuantity > 0 && g.value <= currentPlayer.points)
                )
        });
    }, [modalOptionsReward.playerId, gifts, players]);

    /**
     * Formik édition
     */
    const formEdition = useFormik({
        initialValues: initialEditionValues,
        validationSchema: editionValidationSchema,
        onSubmit: (values) => handleSubmitEdition(values)
    });

    /**
     * Formik cadeau
     */
    const formGift = useFormik({
        initialValues: initialGiftValues,
        validationSchema: giftValidationSchema,
        onSubmit: (values) => handleSubmitGift(values)
    });

    /**
     * Formik participant
     */
    const formPlayer = useFormik({
        initialValues: initialPlayerValues,
        validationSchema: playerValidationSchema,
        onSubmit: (values) => handleSubmitPlayer(values)
    });

    /**
     * Formik récompense
     */
    const formReward = useFormik({
        initialValues: initialRewardValues,
        validationSchema: rewardValidationSchema,
        onSubmit: (values) => handleSubmitReward(values)
    });

    /**
     * Lancement initial de la page (à chaque changement d'id)
     */
    useEffect(() => {
        const editionsService = new EditionsService();

        editionsService
            .getEdition(id)
            .pipe(
                map((dataEdition) => {
                    setEdition(dataEdition.response.data.edition);
                    setGifts(processGiftsData(dataEdition.response.data.gifts));
                    setPlayers(processPlayersData(dataEdition.response.data.players));
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
     * Mise à jour depuis le SSE seulement si les données sont différentes
     */
    useEffect(() => {
        // Mise à jour des cadeaux depuis le SSE
        if (events?.gifts) {
            setGifts((prev) => {
                const next = processGiftsData(events.gifts);
                return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
            });
        }

        // Mise à jour des participants depuis le SSE
        if (events?.players) {
            setPlayers((prev) => {
                const next = processPlayersData(events.players);
                return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
            });
        }
    }, [events]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage && authMessage.target === 'page') {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Mise à jour du formulaire de l'édition aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsEdition.isOpen && edition) {
            formEdition.setValues({
                location: edition.location,
                startDate: getDayFromDate(edition.startDate),
                startTime: getLocalizedTime(edition.startDate),
                endTime: getLocalizedTime(edition.endDate),
                picture: edition.picture,
                pictureAction: null,
                theme: edition.theme,
                challenge: edition.challenge
            });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsEdition.isOpen) {
            formEdition.resetForm();
        }
    }, [modalOptionsEdition.isOpen, edition]);

    /**
     * Mise à jour du formulaire du cadeau aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsGift.isOpen && modalOptionsGift.giftId) {
            const currentGift = gifts.find((g) => g.id === modalOptionsGift.giftId);

            currentGift &&
                formGift.setValues({
                    id: currentGift.id,
                    name: currentGift.name,
                    value: currentGift.value,
                    quantity: currentGift.quantity
                });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsGift.isOpen) {
            formGift.resetForm();
        }
    }, [modalOptionsGift.isOpen, modalOptionsGift.giftId]);

    /**
     * Mise à jour du formulaire du participant aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsPlayer.isOpen && modalOptionsPlayer.playerId) {
            const currentPlayer = players.find((g) => g.id === modalOptionsPlayer.playerId);

            currentPlayer &&
                formPlayer.setValues({
                    id: currentPlayer.id,
                    name: currentPlayer.name,
                    points: 0,
                    giveaway: 0,
                    giveawayPlayerId: ''
                });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsPlayer.isOpen) {
            formPlayer.resetForm();
        }
    }, [modalOptionsPlayer.isOpen, modalOptionsPlayer.playerId]);

    /**
     * Mise à jour du formulaire de récompense aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsReward.isOpen && modalOptionsReward.playerId) {
            const currentPlayer = players.find((g) => g.id === modalOptionsReward.playerId);

            currentPlayer &&
                formReward.setValues({
                    giftId: '',
                    playerId: currentPlayer.id
                });
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsReward.isOpen) {
            formReward.resetForm();
        }
    }, [modalOptionsReward.isOpen, modalOptionsReward.playerId]);

    /**
     * Enrichit les données participants avec la couleur
     * @param {*} playersData Données participants
     * @returns Données participants enrichies
     */
    const processPlayersData = (playersData) => {
        return playersData.map((player) => ({
            ...player,
            color: getIconColor(player.name)
        }));
    };

    /**
     * Enrichit les données cadeaux avec la couleur
     * @param {*} giftsData Données cadeaux
     * @returns Données cadeaux enrichies
     */
    const processGiftsData = (giftsData) => {
        return giftsData.map((gift) => ({
            ...gift,
            color: getIconColor(gift.name)
        }));
    };

    /**
     * Détermine une couleur d'icône en fonction du texte fourni
     * @param {*} text Texte
     * @returns Couleur
     */
    const getIconColor = (text) => {
        const colors = [
            '#2563eb',
            '#7c3aed',
            '#059669',
            '#dc2626',
            '#d97706',
            '#0891b2',
            '#9333ea',
            '#16a34a',
            '#e11d48',
            '#0369a1',
            '#b45309',
            '#1d4ed8'
        ];

        return colors[text.charCodeAt(0) % colors.length];
    };

    /**
     * Ouverture/fermeture de la modale de modification d'édition
     * @param {*} action Action à réaliser
     */
    const openCloseEditionModal = (action = null) => {
        // Ouverture ou fermeture
        setModalOptionsEdition((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Modification de l'édition
     * @param {*} values Données du formulaire
     */
    const handleSubmitEdition = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsEdition((prev) => ({ ...prev, message: null }));

        // Formatage des données
        const body = formatDataEdition(values);

        const editionsService = new EditionsService();

        editionsService
            .updateEdition(edition.id, body)
            .pipe(
                map((dataEdition) => {
                    setMessage({ code: dataEdition.response.message, type: dataEdition.response.status });
                }),
                switchMap(() => editionsService.getEdition(edition.id)),
                map((newDataEdition) => {
                    openCloseEditionModal();
                    setEdition(newDataEdition.response.data.edition);
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsEdition((prev) => ({
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
     * Formate les données édition
     * @param {*} values Données du formulaire
     * @returns Données formatées
     */
    const formatDataEdition = (values) => {
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
     * Ouverture/fermeture de la modale de modification de participant
     * @param {*} action Action à réaliser
     * @param {*} playerId Identifiant participant
     */
    const openClosePlayerModal = (action = null, playerId = null) => {
        // Ouverture ou fermeture
        setModalOptionsPlayer((prev) => ({
            ...prev,
            action: action,
            playerId: playerId,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création ou modification d'un participant
     * @param {*} values Données du formulaire
     */
    const handleSubmitPlayer = (values) => {
        setMessage(null);

        const playersService = new PlayersService();

        let subscriptionPlayers = null;

        switch (modalOptionsPlayer?.action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);
                setModalOptionsPlayer((prev) => ({ ...prev, message: null }));

                subscriptionPlayers = playersService.createPlayer(edition.id, {
                    name: values.name,
                    points: values.points
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);
                setModalOptionsPlayer((prev) => ({ ...prev, message: null }));

                subscriptionPlayers = playersService.updatePlayer(values.id, {
                    name: values.name,
                    points: values.points,
                    giveaway: values.giveaway,
                    giveawayPlayerId: values.giveawayPlayerId
                });
                break;
        }

        subscriptionPlayers
            ?.pipe(
                map((dataPlayer) => {
                    setMessage({ code: dataPlayer.response.message, type: dataPlayer.response.status });
                }),
                switchMap(() => playersService.getEditionPlayers(edition.id)),
                map((dataPlayers) => {
                    openClosePlayerModal();
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsPlayer((prev) => ({
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
     * Ouverture/fermeture de la modale de modification de cadeau
     * @param {*} action Action à réaliser
     * @param {*} giftId Identifiant cadeau
     */
    const openCloseGiftModal = (action = null, giftId = null) => {
        // Ouverture ou fermeture
        setModalOptionsGift((prev) => ({
            ...prev,
            action: action,
            giftId: giftId,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création ou modification d'un cadeau
     * @param {*} values Données du formulaire
     */
    const handleSubmitGift = (values) => {
        setMessage(null);

        const giftsService = new GiftsService();

        let subscriptionGifts = null;

        switch (modalOptionsGift?.action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);
                setModalOptionsGift((prev) => ({ ...prev, message: null }));

                subscriptionGifts = giftsService.createGift(edition.id, {
                    name: values.name,
                    value: values.value,
                    quantity: values.quantity
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);
                setModalOptionsGift((prev) => ({ ...prev, message: null }));

                subscriptionGifts = giftsService.updateGift(values.id, {
                    name: values.name,
                    value: values.value,
                    quantity: values.quantity
                });
                break;
        }

        subscriptionGifts
            ?.pipe(
                map((dataGift) => {
                    setMessage({ code: dataGift.response.message, type: dataGift.response.status });
                }),
                switchMap(() => giftsService.getEditionGifts(edition.id)),
                map((dataGifts) => {
                    openCloseGiftModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsGift((prev) => ({
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
     * Ouverture/fermeture de la modale d'attribution de cadeau
     * @param {*} playerId Identifiant participant
     */
    const openCloseRewardModal = (playerId = null) => {
        // Ouverture ou fermeture
        setModalOptionsReward((prev) => ({
            ...prev,
            playerId: playerId,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Attribution d'un cadeau à un participant
     * @param {*} values Données du formulaire
     */
    const handleSubmitReward = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsReward((prev) => ({ ...prev, message: null }));

        const rewardsService = new RewardsService();
        const giftsService = new GiftsService();
        const playersService = new PlayersService();

        const subscriptionRewards = rewardsService.createReward(values.giftId, values.playerId);
        const subscriptionGifts = giftsService.getEditionGifts(edition.id);
        const subscriptionPlayers = playersService.getEditionPlayers(edition.id);

        subscriptionRewards
            .pipe(
                map((dataReward) => {
                    setMessage({ code: dataReward.response.message, type: dataReward.response.status });
                }),
                switchMap(() => forkJoin([subscriptionGifts, subscriptionPlayers])),
                map(([dataGifts, dataPlayers]) => {
                    openCloseRewardModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsReward((prev) => ({
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
     * Ouvre la modale de suppression d'édition
     */
    const handleConfirmDeleteEdition = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('edition.deleteEdition', {
                year: new Date(edition.startDate).getFullYear(),
                location: edition.location
            }),
            action: 'deleteEdition',
            data: null
        });
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm?.action) {
            case 'deleteEdition':
                return handleDeleteEdition();
            case 'deleteGift':
                return handleDeleteGift(modalOptionsConfirm.data);
            case 'deletePlayer':
                return handleDeletePlayer(modalOptionsConfirm.data);
            case 'deleteReward':
                return handleDeleteReward(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression de l'édition
     */
    const handleDeleteEdition = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const editionsService = new EditionsService();

        editionsService
            .deleteEdition(edition.id)
            .pipe(
                map((dataEdition) => {
                    // Fermeture modale de confirmation
                    openCloseConfirmModal();

                    // Redirection avec message
                    navigate('/', {
                        state: {
                            navMessage: { code: dataEdition.response.message, type: dataEdition.response.status }
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
     * Suppression d'un cadeau
     * @param {*} giftId Identifiant cadeau
     */
    const handleDeleteGift = (giftId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const giftsService = new GiftsService();

        giftsService
            .deleteGift(giftId)
            .pipe(
                map((dataGift) => {
                    setMessage({ code: dataGift.response.message, type: dataGift.response.status });
                }),
                switchMap(() => giftsService.getEditionGifts(edition.id)),
                map((dataGifts) => {
                    openCloseConfirmModal();
                    setGifts(processGiftsData(dataGifts.response.data));
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
     * Suppression d'un participant
     * @param {*} playerId Identifiant participant
     */
    const handleDeletePlayer = (playerId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const playersService = new PlayersService();

        playersService
            .deletePlayer(playerId)
            .pipe(
                map((dataPlayer) => {
                    setMessage({ code: dataPlayer.response.message, type: dataPlayer.response.status });
                }),
                switchMap(() => playersService.getEditionPlayers(edition.id)),
                map((dataPlayers) => {
                    openCloseConfirmModal();
                    setPlayers(processPlayersData(dataPlayers.response.data));
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
     * Suppression d'un cadeau d'un participant
     * @param {*} rewardId Identifiant récompense
     */
    const handleDeleteReward = (rewardId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const rewardsService = new RewardsService();
        const giftsService = new GiftsService();
        const playersService = new PlayersService();

        const subscriptionRewards = rewardsService.deleteReward(rewardId);
        const subscriptionGifts = giftsService.getEditionGifts(edition.id);
        const subscriptionPlayers = playersService.getEditionPlayers(edition.id);

        subscriptionRewards
            .pipe(
                map((dataReward) => {
                    setMessage({ code: dataReward.response.message, type: dataReward.response.status });
                }),
                switchMap(() => forkJoin([subscriptionGifts, subscriptionPlayers])),
                map(([dataGifts, dataPlayers]) => {
                    openCloseConfirmModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                    setPlayers(processPlayersData(dataPlayers.response.data));
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
                    {/* Thème */}
                    {edition?.picture && (
                        <div className="edition-picture-wrapper">
                            <Image
                                src={`${import.meta.env.VITE_API_URL}/serve-file/images?file=${edition.picture}`}
                                alt={edition.picture}
                                className="edition-picture"
                            />
                        </div>
                    )}

                    {/* Contenu */}
                    <div className="position-relative z-2">
                        {/* Message */}
                        {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                        {/* Edition */}
                        {edition && (
                            <>
                                {/* Titre */}
                                <h1 className="d-flex align-items-center gap-2">
                                    <FaComputer size={30} />
                                    {t('edition.editionTitle', {
                                        year: new Date(edition.startDate).getFullYear(),
                                        location: edition.location
                                    })}
                                </h1>

                                {/* Onglets */}
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="players"
                                    id="justify-tab-example"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Participants */}
                                    <Tab eventKey="players" title={t('edition.players')}>
                                        <EditionPlayers
                                            rights={rights}
                                            players={players}
                                            onOpenPlayerModal={openClosePlayerModal}
                                            onOpenRewardModal={openCloseRewardModal}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* Cadeaux */}
                                    <Tab eventKey="gifts" title={t('edition.gifts')}>
                                        <EditionGifts
                                            rights={rights}
                                            gifts={gifts}
                                            onOpen={openCloseGiftModal}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* A propos */}
                                    <Tab eventKey="about" title={t('edition.about')}>
                                        <EditionAbout
                                            rights={rights}
                                            edition={edition}
                                            onOpen={openCloseEditionModal}
                                            onConfirm={handleConfirmDeleteEdition}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>

                                {/* Modale de modification/suppression d'édition */}
                                {rights.isSuperAdmin && formEdition && modalOptionsEdition.isOpen && (
                                    <EditionModal
                                        formData={formEdition}
                                        modalOptions={modalOptionsEdition}
                                        setModalOptions={setModalOptionsEdition}
                                        onClose={openCloseEditionModal}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de création/modification de cadeau */}
                                {rights.isAdminOrSuperAdminOnEdition && formGift && modalOptionsGift.isOpen && (
                                    <GiftModal
                                        gift={gifts.find((g) => g.id === modalOptionsGift.giftId)}
                                        formData={formGift}
                                        modalOptions={modalOptionsGift}
                                        setModalOptions={setModalOptionsGift}
                                        onClose={openCloseGiftModal}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de création/modification de participant */}
                                {rights.isAdminOrSuperAdminOnEdition && formPlayer && modalOptionsPlayer.isOpen && (
                                    <PlayerModal
                                        rights={rights}
                                        player={players.find((p) => p.id === modalOptionsPlayer.playerId)}
                                        players={players}
                                        formData={formPlayer}
                                        modalOptions={modalOptionsPlayer}
                                        setModalOptions={setModalOptionsPlayer}
                                        onClose={openClosePlayerModal}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale d'attribution de cadeau à un participant */}
                                {formReward && modalOptionsReward.isOpen && (
                                    <RewardModal
                                        rights={rights}
                                        player={players.find((p) => p.id === modalOptionsReward.playerId)}
                                        gifts={gifts}
                                        formData={formReward}
                                        modalOptions={modalOptionsReward}
                                        setModalOptions={setModalOptionsReward}
                                        onClose={openCloseRewardModal}
                                        onConfirm={openCloseConfirmModal}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de confirmation */}
                                {rights.isSuperAdmin && modalOptionsConfirm.isOpen && (
                                    <ConfirmModal
                                        modalOptions={modalOptionsConfirm}
                                        setModalOptions={setModalOptionsConfirm}
                                        onClose={openCloseConfirmModal}
                                        onConfirmAction={handleConfirmAction}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Edition;
