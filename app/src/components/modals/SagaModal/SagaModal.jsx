import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaWandSparkles } from 'react-icons/fa6';
import { GiBookshelf } from 'react-icons/gi';

import { TextInput } from '../../inputs';

import { EnumAction } from '../../../enums';

import { Message, SpinnerButton } from '../../shared';

/**
 * Modale campagne
 */
const SagaModal = ({ formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    /**
     * Met le focus sur le champ "nom" à l'ouverture de la modale
     */
    useEffect(() => {
        // Focus à la création
        if (modalOptions?.isOpen && modalOptions.action === EnumAction.CREATE) {
            nameInputRef.current?.focus();
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
     * Détermination du titre selon l'action à réaliser
     */
    const getTitleFromAction = (action) =>
        ({
            create: 'sagas.createSaga',
            update: 'sagas.updateSaga'
        })[action] || 'common.unknownLabel';

    /**
     * Détermination du bouton selon l'action à réaliser
     */
    const getButtonFromAction = (action) =>
        ({
            create: 'common.add',
            update: 'common.update'
        })[action] || 'common.unknownLabel';

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaWandSparkles />
                            {t(getTitleFromAction(modalOptions.action))}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Nom */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('sagas.sagaName')}
                                    icon={<GiBookshelf />}
                                    name={'name'}
                                    ref={nameInputRef}
                                    placeholder={t('sagas.sagaName')}
                                    value={formData.values.name}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.name}
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
                                    inline={true}
                                    setMessage={setModalMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="gap-2 modal-footer-actions">
                            <Button type="button" variant="outline-text-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <SpinnerButton
                                variant="filled-text-action"
                                className="filled-red-button"
                                label={t(getButtonFromAction(modalOptions.action))}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default SagaModal;
