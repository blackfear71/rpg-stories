import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Badge, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import rpgStoriesLogo from '../../../assets/images/rpg-stories.webp';

import { ConnectionModal } from '../../../components/modals';
import { SearchBar } from '../../../components/shared';

import { useAuth } from '../../../utils/context/AuthContext';

import './NavBar.css';

// Valeurs initiales des formulaires
const initialConnectionValues = {
    login: '',
    password: ''
};

/**
 * Barre de navigation
 */
const NavBar = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth, login, logout } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const dropdownRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalOptionsConnection, setModalOptionsConnection] = useState({
        isOpen: false,
        message: null
    });
    const [showDropdown, setShowDropdown] = useState(false);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Mise à jour du formulaire de connexion aux changements de sa modale
     */
    useEffect(() => {
        // Réinitialisation à l'ouverture/fermeture de la modale
        formConnection.resetForm();
    }, [modalOptionsConnection.isOpen]);

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
     * Ferme le menu utilisateur au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };

    /**
     * Ferme le menu utilisateur à la redirection
     */
    const handleRedirect = (page) => {
        setShowDropdown(false);
        navigate(`/${page}`);
    };

    /**
     * Ouverture/fermeture de la modale de connexion
     */
    const openCloseConnectionModal = () => {
        // Ouverture ou fermeture
        setModalOptionsConnection((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Connexion
     */
    const handleSubmitLogin = (values) => {
        setIsSubmitting(true);
        setModalOptionsConnection((prev) => ({ ...prev, message: null }));

        // On attend la promesse de connexion pour fermer la modale
        login(values)
            .then(() => {
                openCloseConnectionModal();
            })
            .catch((err) => {
                setModalOptionsConnection((prev) => ({
                    ...prev,
                    message: { code: err?.code, type: err?.type }
                }));
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    /**
     * Déconnexion
     */
    const handleSubmitLogout = () => {
        // On attend la promesse de déconnexion
        logout();
    };

    return (
        <nav className="d-flex align-items-center jusitfy-content-between gap-3 navbar-container">
            {/* Logo */}
            <Link to="/">
                <Image src={rpgStoriesLogo} alt="rpg-stories" title={t('common.home')} className="navbar-logo" />
            </Link>

            {/* Barre de recherche */}
            <SearchBar />

            {/* Connexion / menu déroulant */}
            <div ref={dropdownRef}>
                <div
                    className="navbar-user-wrapper"
                    onClick={() => (auth.isLoggedIn ? setShowDropdown(!showDropdown) : openCloseConnectionModal())}
                >
                    <FaUserCircle className="navbar-user" />
                    {auth.isLoggedIn && <div className="navbar-user-connected"></div>}
                </div>

                {auth.isLoggedIn && (
                    <Dropdown show={showDropdown} align="end">
                        {showDropdown && <div className="navbar-dropdown-triangle"></div>}

                        <Dropdown.Menu className="p-0 navbar-dropdown">
                            {/* Identifiant connecté */}
                            <Dropdown.Item className="p-2 navbar-dropdown-item">
                                {t('navbar.connectedMessage')}

                                <Badge pill bg="success" className="fs-6 ms-1">
                                    {auth.login}
                                </Badge>
                            </Dropdown.Item>

                            {/* Paramètres */}
                            <Dropdown.Item
                                className="p-2 navbar-dropdown-item d-flex align-items-center"
                                onClick={() => handleRedirect('settings')}
                            >
                                <IoSettingsOutline className="me-2" /> {t('navbar.settings')}
                            </Dropdown.Item>

                            {/* Déconnexion */}
                            <Dropdown.Item className="p-2 navbar-dropdown-item d-flex align-items-center" onClick={handleSubmitLogout}>
                                <IoLogOutOutline className="me-2" /> {t('navbar.disconnect')}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>

            {/* Modale de connexion */}
            {modalOptionsConnection.isOpen && (
                <ConnectionModal
                    formData={formConnection}
                    modalOptions={modalOptionsConnection}
                    setModalOptions={setModalOptionsConnection}
                    onClose={openCloseConnectionModal}
                    isSubmitting={isSubmitting}
                />
            )}
        </nav>
    );
};

export default NavBar;
