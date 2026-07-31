const DB_NAME = 'rpg_stories_drafts_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

/**
 * Ouvre (ou créé) la base IndexedDB et son object store (appelée en interne par toutes les fonctions suivantes)
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Déclenché uniquement à la création de la base ou lors d'un changement de DB_VERSION (utile pour faire évoluer la structure plus tard)
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                // Seul index nécessaire : permet de lister les brouillons d'une campagne sans avoir à charger tous les brouillons de toutes les campagnes
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
export async function getDraftsByCampaign(campaignId) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const index = tx.objectStore(STORE_NAME).index('campaignId');
        const request = index.getAll(campaignId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Récupère un brouillon via son id local
 * @param id Identifiant brouillon
 * @returns Brouillon
 */
export async function getDraftById(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Crée ou met à jour un brouillon (upsert) :
 * - Si l'id n'existe pas encore en base locale -> création
 * - Si l'id existe déjà -> mise à jour
 *
 * @param id Identifiant brouillon
 * @param campaignId Identifiant campagne
 * @param storyId Identifiant histoire (optionnel, à fournir seulement à la modification d'une hisstoire existante)
 * @param texte Saisie
 */
export async function saveDraft({ id, campaignId, storyId, texte }) {
    if (!id || !campaignId) {
        throw new Error('saveDraft: id et campaignId sont obligatoires'); // TODO : voir comment se gèrent les erreurs, si je peux afficher un message classique
    }

    // Construction de l'objet (storyId est optionnel)
    const draft = {
        id,
        campaignId,
        texte,
        date: new Date().toISOString() // La date est toujours recalculée à l'appel pour refléter le moment de sauvegarde
    };

    if (storyId) {
        draft.storyId = storyId;
    }

    // Sauvegarde
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(draft);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Supprime un brouillon
 * @param id Identifiant brouillon
 */
export async function deleteDraft(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
