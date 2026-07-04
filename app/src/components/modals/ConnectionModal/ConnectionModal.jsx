import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaLock, FaUserCircle } from 'react-icons/fa';

import { PasswordInput, TextInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import './ConnectionModal.css';

/**
 * Modale de connexion
 */
const ConnectionModal = ({ formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);

    /**
     * Met le focus sur le champ "login" à l'ouverture de la modale quand on est pas connecté
     */
    useEffect(() => {
        // Focus à l'ouverture
        if (modalOptions?.isOpen) {
            loginInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUserCircle />
                            {t('navbar.connect')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="modal-group">
                            <div className="modal-group-content">
                                {/* Verrou */}
                                <div className="mb-2 text-center">
                                    <div className="d-flex align-items-center justify-content-center mb-1 connection-modal-lock">
                                        <FaLock />
                                    </div>
                                    <div className="connection-modal-lock-text">{t('navbar.adminOnly')}</div>
                                </div>

                                {/* Formulaire */}
                                <div className="d-flex align-items-start gap-2">
                                    <div className="connection-modal-field">
                                        <TextInput
                                            title={t('navbar.login')}
                                            name={'login'}
                                            ref={loginInputRef}
                                            placeholder={t('navbar.login')}
                                            value={formData.values.login}
                                            onChange={formData.handleChange}
                                            error={formData.submitCount > 0 && formData.errors.login}
                                            maxLength={100}
                                            required={true}
                                        />
                                    </div>

                                    <div className="connection-modal-field">
                                        <PasswordInput
                                            title={t('navbar.password')}
                                            name={'password'}
                                            placeholder={t('navbar.password')}
                                            value={formData.values.password}
                                            onChange={formData.handleChange}
                                            error={formData.submitCount > 0 && formData.errors.password}
                                            maxLength={100}
                                            required={true}
                                        />
                                    </div>
                                </div>
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
                                    setMessage={setMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <SpinnerButton label={t('navbar.connect')} isSubmitting={isSubmitting} />
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default ConnectionModal;
