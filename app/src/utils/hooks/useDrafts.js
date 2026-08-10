import { useCallback, useEffect, useState } from 'react';

import {
    deleteDraftIndexedDB,
    deleteDraftsIndexedDB,
    getCampaignDraftsIndexedDB,
    getDraftIndexedDB,
    saveDraftIndexedDB
} from '../../utils/helpers/draftHelper';

/**
 * Hook custom donnant accès aux brouillons locaux (IndexedDB) d'une campagne, avec les actions pour créer/mettre à jour, supprimer et rafraîchir
 */
export function useDrafts(campaignId) {
    // Local states
    const [drafts, setDrafts] = useState([]);
    const [draftLoading, setDraftLoading] = useState(true);

    // Recharge la liste des brouillons de la campagne depuis IndexedDB
    const refreshDrafts = useCallback(async () => {
        if (!campaignId) {
            setDrafts([]);
            setDraftLoading(false);
            return;
        }

        try {
            const result = await getCampaignDraftsIndexedDB(campaignId);

            setDrafts(result);
        } catch {
            throw { code: 'ERR_GET_DRAFTS', type: 'error' };
        } finally {
            setDraftLoading(false);
        }
    }, [campaignId]);

    // Lancement initial du hook (avec rechargement si on change de campagne)
    useEffect(() => {
        refreshDrafts();
    }, [refreshDrafts]);

    /**
     * Créé ou met à jour un brouillon, puis resynchronise l'état local
     */
    const saveDraft = useCallback(
        async ({ draftId, storyId, text }) => {
            try {
                await saveDraftIndexedDB({ draftId, campaignId, storyId, text });
                await refreshDrafts();
            } catch {
                throw { code: 'ERR_SAVE_DRAFT', type: 'error' };
            }
        },
        [campaignId, refreshDrafts]
    );

    /**
     * Supprime un brouillon, puis resynchronise l'état local
     */
    const deleteDraft = useCallback(
        async (draftId) => {
            try {
                await deleteDraftIndexedDB(draftId);
                await refreshDrafts();
                return { code: 'MSG_DELETION_SUCCESS', type: 'success' };
            } catch {
                throw { code: 'ERR_DELETE_DRAFT', type: 'error' };
            }
        },
        [refreshDrafts]
    );

    /**
     * Supprime tous les brouillons, puis resynchronise l'état local
     */
    const deleteDrafts = useCallback(async () => {
        try {
            await deleteDraftsIndexedDB(campaignId);
            await refreshDrafts();
            return { code: 'MSG_DELETION_SUCCESS', type: 'success' };
        } catch {
            throw { code: 'ERR_DELETION_FAILED', type: 'error' };
        }
    }, [refreshDrafts]);

    /**
     * Récupère un brouillon
     */
    const getDraftById = useCallback(async (draftId) => {
        try {
            return await getDraftIndexedDB(draftId);
        } catch {
            throw { code: 'ERR_GET_DRAFT', type: 'error' };
        }
    }, []);

    return { drafts, draftLoading, saveDraft, deleteDraft, deleteDrafts, getDraftById, refreshDrafts };
}
