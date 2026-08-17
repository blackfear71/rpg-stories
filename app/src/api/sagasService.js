import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/sagas';

/**
 * Service appel API sagas
 */
class SagasService {
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
     * Récupération de toutes les sagas
     * @returns Liste des sagas
     */
    getSagas = () => {
        const url = `${this.apiUrl}/all`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Création saga
     * @param {*} body Données saga
     * @returns Message retour
     */
    createSaga = (body) => {
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
     * Mise à jour saga
     * @param {*} sagaId Identifiant saga
     * @param {*} body Données saga
     * @returns Message retour
     */
    updateSaga = (sagaId, body) => {
        const url = `${this.apiUrl}/update/${sagaId}`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression saga
     * @param {*} sagaId Identifiant saga
     * @returns Message retour
     */
    deleteSaga = (sagaId) => {
        const url = `${this.apiUrl}/delete/${sagaId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default SagasService;
