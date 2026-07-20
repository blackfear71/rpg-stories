import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/campaigns';

/**
 * Service appel API campagnes
 */
class CampaignsService {
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
     * Récupération de toutes les campagnes
     * @returns Liste des campagnes
     */
    getCampaigns = () => {
        const url = `${this.apiUrl}/all`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Récupération d'une campagne
     * @param {*} campaignId Identifiant campagne
     * @returns Campagne
     */
    getCampaign = (campaignId) => {
        const url = `${this.apiUrl}/campaign/${campaignId}`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Récupération des campagnes recherchées
     * @param {*} body Saisie
     * @returns Liste des campagnes recherchées
     */
    getSearchCampaigns = (body) => {
        const url = `${this.apiUrl}/search`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST côté back pour la recherche
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Création campagne
     * @param {*} body Données campagne
     * @returns Message retour
     */
    createCampaign = (body) => {
        const url = `${this.apiUrl}/create`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour campagne
     * @param {*} campaignId Identifiant campagne
     * @param {*} body Données campagne
     * @returns Message retour
     */
    updateCampaign = (campaignId, body) => {
        const url = `${this.apiUrl}/update/${campaignId}`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression campagne
     * @param {*} campaignId Identifiant campagne
     * @returns Message retour
     */
    deleteCampaign = (campaignId) => {
        const url = `${this.apiUrl}/delete/${campaignId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default CampaignsService;
