import { Outlet, useLocation } from 'react-router-dom';

import { Footer, NavBar } from '../../../components/shared';

import './Layout.css';

/**
 * Zone d'affichage globale
 */
const Layout = () => {
    const location = useLocation();

    return (
        <div className="d-flex flex-column layout-container">
            {/* Barre de navigation */}
            {location.pathname !== '/' && <NavBar />}

            {/* Effets de fumée */}
            <div className="smoke smoke-left">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="smoke smoke-right">
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Contenu */}
            <main className={`layout-main ${location.pathname !== '/' ? 'layout-main-with-navbar' : ''}`}>
                <Outlet />
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
};

export default Layout;
