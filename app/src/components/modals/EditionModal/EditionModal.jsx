import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaFlagCheckered, FaRegClock, FaScroll, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoCalendarNumberOutline, IoImageOutline, IoLocationOutline } from 'react-icons/io5';

import { DateInput, PictureInput, TextareaInput, TextInput, TimeInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Modale édition
 */
const EditionModal = ({ formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const locationInputRef = useRef(null);

    /**
     * Met le focus sur le champ "lieu" à l'ouverture de la modale
     */
    useEffect(() => {
        // Focus à la création
        if (modalOptions?.isOpen && modalOptions.action === EnumAction.CREATE) {
            locationInputRef.current?.focus();
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
            create: 'home.addEdition',
            update: 'edition.updateEdition'
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
                            <FaWandMagicSparkles />
                            {t(getTitleFromAction(modalOptions.action))}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Lieu */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('edition.location')}
                                    icon={<IoLocationOutline />}
                                    name="location"
                                    ref={locationInputRef}
                                    placeholder={t('edition.location')}
                                    value={formData.values.location}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.location}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Date et heures */}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Date */}
                                <DateInput
                                    title={t('edition.startDate')}
                                    icon={<IoCalendarNumberOutline />}
                                    name={'startDate'}
                                    value={formData.values.startDate}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.startDate}
                                    required={true}
                                />

                                {/* Heures */}
                                <TimeInput
                                    title={t('edition.hours')}
                                    icon={<FaRegClock />}
                                    nameStart={'startTime'}
                                    nameEnd={'endTime'}
                                    titleStart={t('edition.start')}
                                    titleEnd={t('edition.end')}
                                    valueStart={formData.values.startTime}
                                    valueEnd={formData.values.endTime}
                                    onChange={formData.handleChange}
                                    errorStart={formData.submitCount > 0 && formData.errors.startTime}
                                    errorEnd={formData.submitCount > 0 && formData.errors.endTime}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <PictureInput
                                    title={t('edition.picture')}
                                    icon={<IoImageOutline />}
                                    name={'picture'}
                                    value={formData.values.picture}
                                    onChange={handleChangeFile}
                                    error={formData.submitCount > 0 && formData.errors.picture}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Thème & défi*/}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Thème */}
                                <TextareaInput
                                    title={t('edition.theme')}
                                    icon={<FaScroll />}
                                    name={'theme'}
                                    placeholder={t('edition.theme')}
                                    value={formData.values.theme}
                                    onChange={formData.handleChange}
                                />

                                {/* Défi */}
                                <TextareaInput
                                    title={t('edition.challenge')}
                                    icon={<FaFlagCheckered />}
                                    name={'challenge'}
                                    placeholder={t('edition.challenge')}
                                    value={formData.values.challenge}
                                    onChange={formData.handleChange}
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

                            <SpinnerButton label={t(getButtonFromAction(modalOptions.action))} isSubmitting={isSubmitting} />
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default EditionModal;
