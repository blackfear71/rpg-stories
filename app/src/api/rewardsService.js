import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/rewards';

/**
 * Service appel API attribution cadeaux
 */
class RewardsService {
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
     * Attribution d'un cadeau à un participant
     * @param {*} giftId Identifiant cadeau
     * @param {*} playerId Identifiant participant
     * @returns Données retour
     */
    createReward = (giftId, playerId) => {
        const url = `${this.apiUrl}/create/gift/${giftId}/player/${playerId}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Annulation de l'attribution d'un cadeau à un participant
     * @param {*} rewardId Identifiant de la récompense
     * @returns Données retour
     */
    deleteReward = (rewardId) => {
        const url = `${this.apiUrl}/delete/${rewardId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default RewardsService;
