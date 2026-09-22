import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/characters';

/**
 * Service appel API personnages
 */
class CharactersService {
    /**
     * Constructeur du service
     */
    constructor() {
        this.apiUrl = API_URL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Récupération d'un personnage
     * @param {*} campaignId Identifiant campagne
     * @returns Personnage
     */
    getCharacter = (campaignId) => {
        const url = `${this.apiUrl}/campaign/${campaignId}`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Création personnage
     * @param {*} campaignId Identifiant campagne
     * @param {*} body Données personnage
     * @returns Message retour
     */
    createCharacter = (campaignId, body) => {
        const url = `${this.apiUrl}/campaign/${campaignId}/create`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour personnage
     * @param {*} characterId Identifiant personnage
     * @param {*} body Données personnage
     * @returns Message retour
     */
    updateCharacter = (characterId, body) => {
        const url = `${this.apiUrl}/character/${characterId}/update`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression personnage
     * @param {*} characterId Identifiant personnage
     * @returns Message retour
     */
    deleteCharacter = (characterId) => {
        const url = `${this.apiUrl}/character/${characterId}/delete`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };

    // TODO : importCharacter + unlinkCharacter à faire
}

export default CharactersService;
