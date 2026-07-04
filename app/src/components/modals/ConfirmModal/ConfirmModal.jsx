import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';

import { Message, SpinnerButton } from '../../../components/shared';

/**
 * Modale de confirmation
 */
const ConfirmModal = ({ modalOptions, setModalOptions, onClose, onConfirmAction, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmitConfirm = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Soumets le formulaire
        onConfirmAction();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={handleSubmitConfirm}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaQuestionCircle />
                            {t('common.confirm')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="modal-group">
                            <div className="modal-group-content">
                                {/* Texte */}
                                {modalOptions.content}
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Message */}
                        {modalOptions.message && (
                            <div className="modal-message">
                                <Message
                                    code={modalOptions.message.code}
                                    params={modalOptions.message.params}
                                    type={modalOptions.message.type}
                                    setMessage={setModalMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.cancel')}
                            </Button>

                            {onConfirmAction && <SpinnerButton label={t('common.validate')} isSubmitting={isSubmitting} />}
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default ConfirmModal;
