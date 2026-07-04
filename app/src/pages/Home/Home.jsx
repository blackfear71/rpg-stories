import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Button, Spinner } from 'react-bootstrap';
import { IoAddCircleOutline, IoCalendarNumberOutline, IoChevronBackOutline, IoLocationOutline } from 'react-icons/io5';

import { EditionModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../enums';

import { EditionsService } from '../../api';

import './Home.css';

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

/**
 * Page d'accueil
 */
const Home = () => {
    // Router
    const location = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsEdition, setModalOptionsEdition] = useState({
        action: null,
        isOpen: false,
        message: null
    });

    // API states
    const [yearsAndEditions, setYearsAndEditions] = useState([]);
    const [editionsByYear, setEditionsByYear] = useState();

    // Constantes
    const rights = {
        isUser: auth.isLoggedIn && auth.level === EnumUserRole.USER,
        isAdmin: auth.isLoggedIn && auth.level === EnumUserRole.ADMIN,
        isSuperAdmin: auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN
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
     * Formik édition
     */
    const formEdition = useFormik({
        initialValues: initialEditionValues,
        validationSchema: editionValidationSchema,
        onSubmit: (values) => handleSubmitEdition(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        const editionsService = new EditionsService();

        editionsService
            .getAllEditions()
            .pipe(
                map((dataEditions) => {
                    groupByYear(dataEditions.response.data);
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
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage && authMessage.target === 'page') {
            setMessage(authMessage);
            setAuthMessage(null);
        }

        // Message venant du navigate() (déconnexion depuis une page admin, suppression édition)
        if (location.state?.navMessage) {
            setMessage(location.state.navMessage);

            // Nettoyage du state React Router
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [authMessage, setAuthMessage, location.state, location.pathname, navigate]);

    /**
     * Mise à jour du formulaire de l'édition aux changements de sa modale
     */
    useEffect(() => {
        // Réinitialisation à l'ouverture/fermeture de la modale
        formEdition.resetForm();
    }, [modalOptionsEdition.isOpen]);

    /**
     * Regroupe par année les éditions et trie
     * @param {*} editions Liste des éditions
     * @returns Editions regroupées et triées
     */
    const groupByYear = (editions) => {
        const grouped = {};

        editions.forEach((item) => {
            const year = new Date(item.startDate).getFullYear();

            if (!grouped[year]) {
                grouped[year] = [];
            }

            grouped[year].push(item);
        });

        // Trie les lieux dans chaque groupe d'année
        for (const year in grouped) {
            grouped[year].sort((a, b) => a.location.localeCompare(b.location));
        }

        // Trie les années par ordre décroissant
        const sortedArray = Object.keys(grouped)
            .sort((a, b) => b - a)
            .map((year) => ({
                year: Number(year),
                editions: grouped[year]
            }));

        setYearsAndEditions(sortedArray);
    };

    /**
     * Affiche les éditions d'une année
     * @param {*} year Année
     */
    const showEditionsByYear = (year) => {
        setEditionsByYear(year.editions);
    };

    /**
     * Affiche les années
     */
    const showYearsOfEditions = () => {
        setEditionsByYear([]);
    };

    /**
     * Ouverture/fermeture de la modale de création d'édition
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
     * Création édition
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
            .createEdition(body)
            .pipe(
                map((dataEdition) => {
                    setMessage({ code: dataEdition.response.message, type: dataEdition.response.status });
                }),
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response.data);
                    openCloseEditionModal();
                    setEditionsByYear([]);
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

                    {/* Titre */}
                    <h1 className="d-flex align-items-center gap-2">
                        {editionsByYear && editionsByYear.length > 0 ? (
                            <>
                                <IoLocationOutline size={30} />
                                {t('home.editionsTitle', { year: new Date(editionsByYear[0].startDate).getFullYear() })}
                            </>
                        ) : (
                            <>
                                <IoCalendarNumberOutline size={30} />
                                {t('home.editions')}
                            </>
                        )}
                    </h1>

                    {/* Grille */}
                    <div className="gap-2 mt-3 home-grid">
                        {/* Ajout */}
                        {rights.isSuperAdmin && (
                            <Button
                                variant="outline-action"
                                className="d-flex align-items-center home-grid-btn-action"
                                onClick={() => openCloseEditionModal(EnumAction.CREATE)}
                                disabled={isSubmitting}
                            >
                                <IoAddCircleOutline size={30} />
                                {t('home.addEdition')}
                            </Button>
                        )}

                        {/* Années et éditions */}
                        {(yearsAndEditions && yearsAndEditions.length > 0) || (editionsByYear && editionsByYear.length > 0) ? (
                            editionsByYear && editionsByYear.length > 0 ? (
                                <>
                                    {/* Retour */}
                                    <Button
                                        variant="outline-action"
                                        className="d-flex align-items-center home-grid-btn-action btn-yellow"
                                        onClick={showYearsOfEditions}
                                        disabled={isSubmitting}
                                    >
                                        <IoChevronBackOutline size={25} />
                                        {t('common.return')}
                                    </Button>

                                    {/* Editions */}
                                    {editionsByYear.map((edition) => (
                                        <Button
                                            key={edition.id}
                                            variant="action"
                                            className="home-grid-btn-location"
                                            onClick={() => navigate(`/edition/${edition.id}`)}
                                            disabled={isSubmitting}
                                        >
                                            <span className="home-grid-btn-label">{edition.location}</span>
                                            <span className="home-grid-btn-badge">
                                                {t(edition.playerCount === 1 ? 'home.countPlayer' : 'home.countPlayers', {
                                                    count: edition.playerCount
                                                })}
                                            </span>
                                        </Button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* Années */}
                                    {yearsAndEditions.map((year) => (
                                        <Button
                                            key={year.year}
                                            variant="action"
                                            className="home-grid-btn-year"
                                            onClick={() => showEditionsByYear(year)}
                                            disabled={isSubmitting}
                                        >
                                            <span className="home-grid-btn-label">{year.year}</span>
                                            <span className="home-grid-btn-badge">
                                                {t(year.editions.length === 1 ? 'home.countEdition' : 'home.countEditions', {
                                                    count: year.editions.length
                                                })}
                                            </span>
                                        </Button>
                                    ))}
                                </>
                            )
                        ) : (
                            <div
                                className={`d-flex align-items-center justify-content-center px-2 py-3 home-empty ${rights.isSuperAdmin ? '' : ' home-empty-full'}`}
                            >
                                {t('home.noEdition')}
                            </div>
                        )}
                    </div>

                    {/* Modale de création d'édition */}
                    {rights.isSuperAdmin && formEdition && modalOptionsEdition.isOpen && (
                        <EditionModal
                            formData={formEdition}
                            modalOptions={modalOptionsEdition}
                            setModalOptions={setModalOptionsEdition}
                            onClose={openCloseEditionModal}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default Home;
