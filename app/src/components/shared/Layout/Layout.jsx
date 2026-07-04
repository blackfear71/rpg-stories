import { Outlet } from 'react-router-dom';

import { Footer, NavBar } from '../../../components/shared';

import './Layout.css';

/**
 * Zone d'affichage globale
 */
const Layout = () => {
    return (
        <div className="d-flex flex-column layout-container">
            {/* Barre de navigation */}
            <NavBar />

            {/* Contenu */}
            <main className="layout-main">
                <Outlet />
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
};

export default Layout;
