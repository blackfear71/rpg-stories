import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/players';

/**
 * Service appel API participants
 */
class PlayersService {
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
     * Récupération de tous les participants d'une édition
     * @param {*} editionId Identifiant édition
     * @returns Liste des participants
     */
    getEditionPlayers = (editionId) => {
        const url = `${this.apiUrl}/edition/${editionId}`;
        return ajax.get(url, this.headers);
    };

    /**
     * Création d'un nouveau participant
     * @param {*} editionId Identifiant édition
     * @param {*} body Données participant
     * @returns Données retour
     */
    createPlayer = (editionId, body) => {
        const url = `${this.apiUrl}/create/edition/${editionId}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour participant
     * @param {*} playerId Identifiant participant
     * @param {*} body Données participant
     * @returns Données retour
     */
    updatePlayer = (playerId, body) => {
        const url = `${this.apiUrl}/update/${playerId}`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression d'un participant
     * @param {*} playerId Identifiant participant
     * @returns Données retour
     */
    deletePlayer = (playerId) => {
        const url = `${this.apiUrl}/delete/${playerId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default PlayersService;
