import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { HiKey, HiOutlineKey } from 'react-icons/hi2';

import { PasswordInput } from '../../inputs';
import { Message, SpinnerButton } from '../../shared';

/**
 * Modale mot de passe
 */
const PasswordModal = ({ user, formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const passwordInputRef = useRef(null);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        // Focus à l'ouverture
        if (modalOptions?.isOpen) {
            passwordInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <HiKey />
                            {t('settings.password')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="d-flex align-items-center gap-2 p-2 settings-modal-user">
                            {/* Icône */}
                            <div className="d-flex align-items-center justify-content-center settings-modal-icon">{user.role?.icon}</div>

                            {/* Identifiant et rôle */}
                            <div className="d-flex flex-column flex-grow-1 settings-modal-name">
                                <span className="settings-modal-ellipsis-text">{user.login}</span>
                                <div className="d-flex align-items-center gap-2 settings-modal-role">{user.role?.label}</div>
                            </div>
                        </div>

                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Ancien mot de passe */}
                                <PasswordInput
                                    title={t('settings.oldPassword')}
                                    icon={<HiOutlineKey />}
                                    name={'oldPassword'}
                                    ref={passwordInputRef}
                                    placeholder={t('settings.oldPassword')}
                                    value={formData.values.oldPassword}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.oldPassword}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Nouveau mot de passe */}
                                <PasswordInput
                                    title={t('settings.newPassword')}
                                    icon={<HiKey />}
                                    name={'password'}
                                    placeholder={t('settings.newPassword')}
                                    value={formData.values.password}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.password}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Confirmation nouveau mot de passe */}
                                <PasswordInput
                                    title={t('settings.confirmPassword')}
                                    icon={<HiKey />}
                                    name={'confirmPassword'}
                                    placeholder={t('settings.confirmPassword')}
                                    value={formData.values.confirmPassword}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.confirmPassword}
                                    maxLength={100}
                                    required={true}
                                />
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
                                {t('common.close')}
                            </Button>

                            <SpinnerButton label={t('common.validate')} isSubmitting={isSubmitting} />
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default PasswordModal;
