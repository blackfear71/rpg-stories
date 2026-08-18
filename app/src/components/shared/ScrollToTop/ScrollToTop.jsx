import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scroll en haut à chaque navigation
 */
const ScrollToTop = () => {
    // Local states
    const { pathname } = useLocation();

    /**
     * Scroll en haut à chaque navigation
     */
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
