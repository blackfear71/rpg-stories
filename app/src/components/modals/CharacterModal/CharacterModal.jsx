import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { GiPointyHat, GiPortrait, GiSwordsPower } from 'react-icons/gi';

import { PictureInput, TextInput } from '../../inputs';

import { EnumAction } from '../../../enums';

import { Message, SpinnerButton } from '../../shared';

/**
 * Modale personnage
 */
const CharacterModal = ({ formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
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
     * Met à jour le formulaire à la saisie d'un fichier
     * @param {*} file Fichier
     * @param {*} action Action à réaliser
     */
    const handleChangeFile = (file, action) => {
        switch (action) {
            case EnumAction.CREATE:
                formData.setValues((prev) => ({ ...prev, picture: file, pictureAction: action }));
                break;
            case EnumAction.DELETE:
                formData.setValues((prev) => ({ ...prev, picture: null, pictureAction: action }));
                break;
            default:
                formData.setValues((prev) => ({ ...prev, picture: null, pictureAction: null }));
                break;
        }
    };

    /**
     * Détermination du titre selon l'action à réaliser
     */
    const getTitleFromAction = (action) =>
        ({
            create: 'character.createCharacter',
            update: 'character.updateCharacter'
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
                            <GiPointyHat />
                            {t(getTitleFromAction(modalOptions.action))}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Nom */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('character.characterName')}
                                    icon={<GiSwordsPower />}
                                    name={'name'}
                                    ref={nameInputRef}
                                    placeholder={t('character.characterName')}
                                    value={formData.values.name}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.name}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <PictureInput
                                    title={t('campaign.picture')}
                                    icon={<GiPortrait />}
                                    name={'picture'}
                                    value={formData.values.picture}
                                    onChange={handleChangeFile}
                                    error={formData.submitCount > 0 && formData.errors.picture}
                                    isSubmitting={isSubmitting}
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

export default CharacterModal;
