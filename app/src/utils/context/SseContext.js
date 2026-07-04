import { createContext, useContext } from 'react';

/**
 * Création du contexte
 */
export const SseContext = createContext(null);

/**
 * Hook personnalisé pour consommer le contexte
 */
export const useSse = () => {
    const context = useContext(SseContext);

    if (!context) {
        throw new Error('useSse must be used in a SseProvider');
    }

    return context;
};
