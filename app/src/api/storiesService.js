import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/stories';

/**
 * Service appel API histoires
 */
class StoriesService {
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
     * Récupération de tous les histoires d'une campagne
     * @param {*} campaignId Identifiant campagne
     * @returns Liste des histoires
     */
    getCampaignStories = (campaignId) => {
        const url = `${this.apiUrl}/campaign/${campaignId}`;
        return ajax.get(url, this.headers);
    };

    /**
     * Création d'une nouvelle histoire
     * @param {*} campaignId Identifiant campagne
     * @param {*} body Données histoire
     * @returns Données retour
     */
    createStory = (campaignId, body) => {
        const url = `${this.apiUrl}/create/campaign/${campaignId}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour histoire
     * @param {*} storyId Identifiant histoire
     * @param {*} body Données histoire
     * @returns Données retour
     */
    updateStory = (storyId, body) => {
        const url = `${this.apiUrl}/update/${storyId}`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression d'une histoire
     * @param {*} storyId Identifiant histoire
     * @returns Données retour
     */
    deleteStory = (storyId) => {
        const url = `${this.apiUrl}/delete/${storyId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default StoriesService;
