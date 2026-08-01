const DB_NAME = 'rpg_stories_drafts_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

/**
 * Ouvre (ou créé) la base IndexedDB et son object store (appelée en interne par toutes les fonctions suivantes)
 */
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Déclenché uniquement à la création de la base ou lors d'un changement de DB_VERSION (pour faire évoluer la structure plus tard)
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                // Index nécessaire : permet de lister les brouillons d'une campagne sans avoir à charger tous les brouillons de toutes les campagnes
                store.createIndex('campaignId', 'campaignId', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Récupère tous les brouillons d'une campagne donnée
 * @param campaignId Identifiant campagne
 * @returns Liste des brouillons
 */
export async function getCampaignDraftsIndexedDB(campaignId) {
    const db = await openIndexedDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const index = tx.objectStore(STORE_NAME).index('campaignId');
        const request = index.getAll(campaignId);

        request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.date) - new Date(a.date)));
        request.onerror = () => reject(request.error);
    });
}

/**
 * Récupère un brouillon via son id local
 * @param draftId Identifiant brouillon
 * @returns Brouillon
 */
export async function getDraftIndexedDB(draftId) {
    const db = await openIndexedDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(draftId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Crée ou met à jour un brouillon (upsert) :
 * - Si l'id n'existe pas encore en base locale -> création
 * - Si l'id existe déjà -> mise à jour
 *
 * @param draftId Identifiant brouillon
 * @param campaignId Identifiant campagne
 * @param storyId Identifiant histoire (optionnel, à fournir seulement à la modification d'une hisstoire existante)
 * @param text Saisie
 */
export async function saveDraftIndexedDB({ draftId, campaignId, storyId, text }) {
    if (text) {
        if (!draftId || !campaignId) {
            throw new Error();
        }

        // Construction de l'objet (l'id n'est pas auto-incrémenté et doit être généré manuellement à la sauvegarde pour toujours mettre à jour le bon enregistrement)
        const draft = {
            id: draftId,
            campaignId: campaignId,
            text: text,
            date: new Date().toISOString() // La date est toujours recalculée à l'appel pour refléter le moment de sauvegarde
        };

        // storyId est optionnel
        if (storyId) {
            draft.storyId = storyId;
        }

        // Sauvegarde
        const db = await openIndexedDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(draft);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

/**
 * Supprime un brouillon
 * @param draftId Identifiant brouillon
 */
export async function deleteDraftIndexedDB(draftId) {
    const db = await openIndexedDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(draftId);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
