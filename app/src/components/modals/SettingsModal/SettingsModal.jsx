import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { HiIdentification, HiKey } from 'react-icons/hi';

import { ConfirmInput, PasswordInput, SelectInput, TextInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Modale utilisateur
 */
const SettingsModal = ({ user, formData, modalOptions, setModalOptions, onReset, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        // Focus à la création
        if (modalOptions?.isOpen) {
            modalOptions.action === EnumAction.CREATE && loginInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        formData.setValues((prev) => ({
            ...prev,
            level: e.target.value === '' ? null : parseInt(e.target.value)
        }));
    };

    /**
     * Renvoie une liste de rôles sélectionnables
     */
    const getLevelOptions = () => {
        return [0, 1, 2].map((r) => ({
            key: r,
            value: r,
            label: t(`settings.level${r}`)
        }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUser />
                            {modalOptions.action === EnumAction.CREATE ? t('settings.createUser') : t('settings.manageUser')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Utilisateur */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="d-flex align-items-center gap-2 p-2 settings-modal-user">
                                {/* Icône */}
                                <div className="d-flex align-items-center justify-content-center settings-modal-icon">
                                    {user.role?.icon}
                                </div>

                                {/* Identifiant et rôle */}
                                <div className="d-flex flex-column flex-grow-1 settings-modal-name">
                                    <span className="settings-modal-ellipsis-text">{user.login}</span>
                                    <div className="d-flex align-items-center gap-2 settings-modal-role">{user.role?.label}</div>
                                </div>
                            </div>
                        )}

                        {/* Saisies */}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Identifiant */}
                                {modalOptions.action === EnumAction.CREATE && (
                                    <TextInput
                                        title={t('settings.login')}
                                        icon={<FaUserCircle />}
                                        name={'login'}
                                        ref={loginInputRef}
                                        placeholder={t('settings.login')}
                                        value={formData.values.login}
                                        onChange={formData.handleChange}
                                        error={formData.submitCount > 0 && formData.errors.login}
                                        maxLength={100}
                                        required={true}
                                    />
                                )}

                                {/* Rôle */}
                                <SelectInput
                                    title={
                                        modalOptions.action === EnumAction.CREATE ? t('settings.chooseLevel') : t('settings.updateLevel')
                                    }
                                    icon={<HiIdentification />}
                                    name={'level'}
                                    defaultOption={{ key: 0, value: '', label: t('settings.chooseLevel') }}
                                    options={getLevelOptions()}
                                    value={formData.values.level}
                                    onChange={handleChangeSelect}
                                    error={formData.submitCount > 0 && formData.errors.level}
                                    required={true}
                                />

                                {/* Description du niveau sélectionné */}
                                {formData.values.level !== '' && (
                                    <div className="px-2 py-1 settings-modal-description">
                                        {t(`settings.levelDescription${formData.values.level}`)}
                                    </div>
                                )}

                                {modalOptions.action === EnumAction.CREATE && (
                                    <>
                                        {/* Mot de passe */}
                                        <PasswordInput
                                            title={t('settings.password')}
                                            icon={<HiKey />}
                                            name={'password'}
                                            placeholder={t('settings.password')}
                                            value={formData.values.password}
                                            onChange={formData.handleChange}
                                            error={formData.submitCount > 0 && formData.errors.password}
                                            maxLength={100}
                                            required={true}
                                        />

                                        {/* Confirmation mot de passe */}
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
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Réinitialiser le mot de passe */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    <ConfirmInput
                                        title={t('settings.resetPassword')}
                                        buttonLabel={t('common.reset')}
                                        onConfirm={() => onReset(user.id)}
                                    />
                                </div>
                            </div>
                        )}
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

export default SettingsModal;
