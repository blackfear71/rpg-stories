import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

// TODO : de manière générale chercher "superadmin", "dition", "cadeau" et "gift", il ne doit pas en rester (front+back+fichiers)
// TODO : revoir les droits, SUPERADMIN disparait, et donc USER a tous les droits sur ses actions, l'ADMIN servira à de la gestion
// TODO : finir / nettoyer le style

/**
 * Page d'accueil
 */
const Home = () => {
    // Router
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
        // Redirection vers les campagnes si connecté, sinon on affiche le formulaire de connexion
        if (auth && auth.isLoggedIn) {
            navigate('/campaigns');
        } else {
            setIsLoading(false);
            loginInputRef.current?.focus();
        }
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
    }, [authMessage, setAuthMessage]);

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
                            <Image src={rpgStoriesLogo} alt="rpg-stories" title={t('common.home')} className="home-logo" />

                            {/* Texte RPG / STORIES centré */}
                            <div className="d-flex flex-column align-items-start">
                                <span className="home-title-1">RPG</span>
                                <span className="home-title-2 ms-1">STORIES</span>
                            </div>
                        </div>

                        {/* Connexion */}
                        {/* TODO : changer la police du site */}
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
                                        onChange={formConnection.handleChange}
                                        error={formConnection.submitCount > 0 && formConnection.errors.password}
                                        maxLength={100}
                                        required={true}
                                    />

                                    {/* Boutons d'action */}
                                    <SpinnerButton variant={'action'} label={t('navbar.connect')} isSubmitting={isSubmitting} />
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
