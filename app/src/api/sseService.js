const API_URL = import.meta.env.VITE_API_URL + '/sse';

/**
 * Service appel API SSE
 */
class SseService {
    /**
     * Constructeur du service
     */
    constructor() {
        this.apiUrl = API_URL;
    }

    /**
     * Récupération d'une édition via SSE
     * @returns Données SSE
     */
    getSseEdition = (id) => {
        const url = `${this.apiUrl}/edition/${id}`;
        return new EventSource(url);
    };
}

export default SseService;
