import { useCallback, useEffect, useState } from 'react';

// TODO : je n'aime pas les "as" juste parce que les noms sont identiques...
import {
    deleteDraft as dbDeleteDraft,
    getDraftById as dbGetDraftById,
    getDraftsByCampaign as dbGetDraftsByCampaign,
    saveDraft as dbSaveDraft
} from '../../utils/helpers/draftHelper';

/**
 * Hook custom donnant accès aux brouillons locaux (IndexedDB) d'une campagne, avec les actions pour créer/mettre à jour, supprimer et rafraîchir
 */
export function useDrafts(campaignId) {
    // Local states
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Recharge la liste des brouillons de la campagne depuis IndexedDB
    const refresh = useCallback(async () => {
        if (!campaignId) {
            setDrafts([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const result = await dbGetDraftsByCampaign(campaignId);

            setDrafts(result);
            setError(null);
        } catch (err) {
            setError(err); // TODO : à voir
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    // Lancement initial du hook (avec rechargement si on change de campagne)
    useEffect(() => {
        refresh();
    }, [refresh]);

    /**
     * Créé ou met à jour un brouillon, puis resynchronise l'état local
     */
    const saveDraft = useCallback(
        async ({ id, storyId, texte }) => {
            try {
                await dbSaveDraft({ id, storyId, campaignId, texte });
                await refresh();
                setError(null);
            } catch (err) {
                setError(err);
                throw err; // TODO : à voir
            }
        },
        [campaignId, refresh]
    );

    /**
     * Supprime un brouillon, puis resynchronise l'état local
     */
    const deleteDraft = useCallback(
        async (id) => {
            try {
                await dbDeleteDraft(id);
                await refresh();
                setError(null);
            } catch (err) {
                setError(err);
                throw err;
            }
        },
        [refresh]
    );

    /**
     * Récupère un brouillon précis (TODO : voir si c'est utile)
     */
    const getDraftById = useCallback(async (id) => {
        return dbGetDraftById(id);
    }, []);

    return { drafts, loading, error, saveDraft, deleteDraft, getDraftById, refresh };
}
