import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Form, Image, Spinner } from 'react-bootstrap';

import rpgStoriesLogo from '../../assets/images/rpg-stories.webp';

import { PasswordInput, TextInput } from '../../components/inputs';
import { Message, SpinnerButton } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

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
    const { auth, authMessage, login, refreshAuth, setAuthMessage, skipAutoRedirectRef } = useAuth();

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
        // Rafraichissement du contexte d'authentification
        refreshAuth(true);
    }, []);

    /**
     * Redirection vers les campagnes si déjà connecté au chargement, sinon affichage du formulaire de connexion
     */
    useEffect(() => {
        if (auth && auth.isLoggedIn) {
            // Redirection si déjà connecté (en évitant la navigation concurrente à la connexion)
            if (skipAutoRedirectRef.current) {
                skipAutoRedirectRef.current = false;
            } else {
                navigate('/campaigns');
            }
        } else {
            // Focus sur l'identifiant
            setIsLoading(false);
            loginInputRef.current?.focus();
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

        // Message venant du navigate() (déconnexion)
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

        // On attend la promesse de connexion pour rediriger
        login(values)
            .then((loginMessage) => {
                navigate('/campaigns', {
                    state: {
                        navMessage: loginMessage
                    }
                });
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
                <div className="home-form-container">
                    {/* Message */}
                    {message && (
                        <div className="home-form-message">
                            <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />
                        </div>
                    )}

                    {/* Contenu */}
                    <div className="d-flex flex-column align-items-center justify-content-center gap-3">
                        {/* Logo & titre */}
                        <div className="d-flex align-items-center gap-3">
                            {/* Logo */}
                            <Image src={rpgStoriesLogo} alt="rpg-stories" title={t('home.rpgStories')} className="home-logo" />

                            {/* Titre */}
                            <div className="d-flex flex-column align-items-start home-title-container">
                                <span className="home-title-1">{t('home.rpg')}</span>
                                <span className="home-title-2 ms-1">{t('home.stories')}</span>
                            </div>
                        </div>

                        {/* Connexion */}
                        <Form onSubmit={formConnection.handleSubmit} className="home-form">
                            <fieldset disabled={isSubmitting}>
                                {/* Formulaire */}
                                <div className="d-flex flex-column gap-3 p-3 input-container">
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

                                    <PasswordInput
                                        title={t('navbar.password')}
                                        name={'password'}
                                        placeholder={t('navbar.password')}
                                        value={formConnection.values.password}
                                        inputClassName="home-password-input"
                                        buttonClassName="home-password-input-button"
                                        onChange={formConnection.handleChange}
                                        error={formConnection.submitCount > 0 && formConnection.errors.password}
                                        maxLength={100}
                                        required={true}
                                    />

                                    {/* Boutons d'action */}
                                    <SpinnerButton
                                        variant="filled-text-action"
                                        className="home-button"
                                        label={t('navbar.connect')}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            </fieldset>
                        </Form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;
