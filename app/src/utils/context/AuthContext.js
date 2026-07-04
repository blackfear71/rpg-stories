import { createContext, useContext } from 'react';

/**
 * Création du contexte
 */
export const AuthContext = createContext(null);

/**
 * Hook personnalisé pour consommer le contexte
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used in an AuthProvider');
    }

    return context;
};
