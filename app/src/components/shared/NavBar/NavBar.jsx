import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { Badge, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import rpgStoriesLogo from '../../../assets/images/rpg-stories.webp';

import { SearchBar } from '../../../components/shared';

import { useAuth } from '../../../utils/context/AuthContext';

import './NavBar.css';

/**
 * Barre de navigation
 */
const NavBar = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth, logout } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const dropdownRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
     * Déconnexion
     */
    const handleSubmitLogout = () => {
        // On attend la promesse de déconnexion
        logout();
    };

    return (
        <nav className="d-flex align-items-center jusitfy-content-between gap-3 navbar-container">
            {/* Logo & titre */}
            <Link to="/" className="d-flex align-items-center gap-2">
                {/* Logo */}
                <Image src={rpgStoriesLogo} alt="rpg-stories" title={t('common.home')} className="navbar-logo" />

                {/* Titre */}
                <div className="d-flex flex-column align-items-start navbar-title">
                    <span className="navbar-title-1">{t('home.rpg')}</span>
                    <span className="navbar-title-2">{t('home.stories')}</span>
                </div>
            </Link>

            {/* Barre de recherche */}
            <SearchBar />

            {/* Connexion / menu déroulant */}
            <div ref={dropdownRef}>
                <div className="navbar-user-wrapper" onClick={() => setShowDropdown(!showDropdown)}>
                    <FaUserCircle className="navbar-user" />
                    <div className="navbar-user-connected"></div>
                </div>

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
            </div>
        </nav>
    );
};

export default NavBar;
