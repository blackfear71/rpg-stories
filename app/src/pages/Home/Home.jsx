import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Button, Form, Image, Spinner } from 'react-bootstrap';
import { FaLock, FaUserCircle } from 'react-icons/fa';
import { IoAddCircleOutline, IoCalendarNumberOutline, IoChevronBackOutline, IoLocationOutline } from 'react-icons/io5';

import rpgStoriesLogo from '../../assets/images/rpg-stories.webp';

import { PasswordInput, TextInput } from '../../components/inputs';
import { Message, SpinnerButton } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../enums';

import { EditionsService } from '../../api';

import './Home.css';

// Valeurs initiales des formulaires
const initialConnectionValues = {
    login: '',
    password: ''
};

/**
 * Page d'accueil
 */
const Home = () => {
    // Router
    const location = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, login, setAuthMessage } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    /**
     * Schéma de validation Yup de connexion
     */
    const connectionValidationSchema = useMemo(() => {
        return Yup.object({
            login: Yup.string().required('errors.invalidLogin'),
            password: Yup.string().required('errors.invalidPassword')
        });
    }, []);

    /**
     * Formik connexion
     */
    const formConnection = useFormik({
        initialValues: initialConnectionValues,
        validationSchema: connectionValidationSchema,
        onSubmit: (values) => handleSubmitLogin(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // TODO : si connecté, prévoir une redirection automatique vers les campagnes
        setIsLoading(false);
        loginInputRef.current?.focus();
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
     * Connexion
     */
    const handleSubmitLogin = (values) => {
        setIsSubmitting(true);
        setMessage(null);

        // On attend la promesse de connexion pour fermer la modale
        login(values)
            .then(() => {
                navigate('/campaigns');
            })
            .catch((err) => {
                setMessage({ code: err?.code, type: err?.type });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
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
                    {/* TODO : faire en sorte qu'il ait une position fixed sous la navbar (attention à la page de connexion) */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Contenu */}
                    <div className="d-flex flex-column align-items-center justify-content-center gap-3 home-form-container">
                        {/* Logo & titre */}
                        <div className="d-flex align-items-center gap-3">
                            {/* Logo */}
                            <Image src={rpgStoriesLogo} alt="rpg-stories" title={t('common.home')} className="home-logo" />

                            {/* Texte RPG / STORIES centré */}
                            <div className="d-flex flex-column align-items-start">
                                <span className="home-title-1">RPG</span>
                                <span className="home-title-2 ms-1">STORIES</span>
                            </div>
                        </div>

                        {/* Connexion */}
                        {/* TODO : prendre une largeur fixe sur PC, toute la largeur sur mobile */}
                        {/* TODO : finir / nettoyer le style */}
                        <Form onSubmit={formConnection.handleSubmit}>
                            <fieldset disabled={isSubmitting}>
                                {/* Formulaire */}
                                <div className="d-flex flex-column gap-3 p-3 home-form">
                                    <div className="connection-modal-field">
                                        <TextInput
                                            title={t('navbar.login')}
                                            name={'login'}
                                            ref={loginInputRef}
                                            placeholder={t('navbar.login')}
                                            value={formConnection.values.login}
                                            onChange={formConnection.handleChange}
                                            error={formConnection.submitCount > 0 && formConnection.errors.login}
                                            maxLength={100}
                                            required={true}
                                        />
                                    </div>

                                    <div className="connection-modal-field">
                                        <PasswordInput
                                            title={t('navbar.password')}
                                            name={'password'}
                                            placeholder={t('navbar.password')}
                                            value={formConnection.values.password}
                                            onChange={formConnection.handleChange}
                                            error={formConnection.submitCount > 0 && formConnection.errors.password}
                                            maxLength={100}
                                            required={true}
                                        />
                                    </div>

                                    {/* Boutons d'action */}
                                    <SpinnerButton label={t('navbar.connect')} isSubmitting={isSubmitting} />
                                </div>
                            </fieldset>
                        </Form>
                    </div>
                </>
            )}
        </>
    );
};

export default Home;
