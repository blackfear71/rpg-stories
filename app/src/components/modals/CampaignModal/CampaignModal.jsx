import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaRegClock, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoImageOutline, IoLocationOutline } from 'react-icons/io5';

import { IncrementInput, PictureInput, TextInput } from '../../../components/inputs';

import { EnumAction } from '../../../enums';

import { Message, SpinnerButton } from '../../shared';

/**
 * Modale édition
 */
const CampaignModal = ({ formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    /**
     * Met le focus sur le champ "lieu" à l'ouverture de la modale
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
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} action Action à réaliser
     */
    const handleChangePlayers = (action) => {
        // Ajoute ou retire un joueur
        switch (action) {
            case 'add':
                formData.setFieldValue('players', (parseInt(formData.values.players) || 0) + 1);
                break;
            case 'remove':
                formData.setValues((prev) => {
                    const currentPlayers = parseInt(prev.players) || 0;

                    return {
                        ...prev,
                        players: currentPlayers <= 0 ? 0 : currentPlayers - 1
                    };
                });
                break;
        }
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
            create: 'campaign.createCampaign',
            update: 'campaign.updateCampaign'
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
                        {/* Nom */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('campaign.campaignName')}
                                    icon={<IoLocationOutline />}
                                    name="name"
                                    ref={nameInputRef}
                                    placeholder={t('campaign.campaignName')}
                                    value={formData.values.name}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.name}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Univers */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('campaign.universe')}
                                    icon={<IoLocationOutline />}
                                    name="universe"
                                    placeholder={t('campaign.universe')}
                                    value={formData.values.universe}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.universe}
                                    maxLength={100}
                                />
                            </div>
                        </div>

                        {/* Nombre de joueurs */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <IncrementInput
                                    title={t('campaign.playersCount')}
                                    icon={<FaRegClock />}
                                    name={'players'}
                                    value={formData.values.players}
                                    onChangeDown={() => handleChangePlayers('remove')}
                                    onChangeUp={() => handleChangePlayers('add')}
                                    error={formData.submitCount > 0 && formData.errors.players}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <PictureInput
                                    title={t('campaign.picture')}
                                    icon={<IoImageOutline />}
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
                                    setMessage={setModalMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <SpinnerButton
                                variant={'modal-action'}
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

export default CampaignModal;
