import { useTranslation } from 'react-i18next';

import { Badge, Button, Modal } from 'react-bootstrap';
import { FaArrowRight, FaTrashCan } from 'react-icons/fa6';
import { MdRestorePage } from 'react-icons/md';

import { Message } from '../../../components/shared';

import { getLocalizedDateAndTime } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

import './DraftsModal.css';

/**
 * Modale campagne
 */
const DraftsModal = ({ draftsState, modalOptions, setModalOptions, onClose, onOpenInput, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Contexte
    const { deleteDraft, drafts } = draftsState;

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    /**
     * Suppression du brouillon
     * @param {*} draftId Identifiant brouillon
     */
    const handleDeleteDraft = async (draftId) => {
        try {
            await deleteDraft(draftId);
        } catch (err) {
            setModalMessage(err);
        }
    };

    /**
     * Injection du brouillon
     * @param {*} draft Brouillon
     */
    const handleEditDraft = (draft) => {
        // Fermeture de la modale
        onClose();

        // Ouverture de la saisie
        if (draft.storyId) {
            onOpenInput(EnumAction.UPDATE, draft.storyId, draft.id);
        } else {
            onOpenInput(EnumAction.CREATE, null, draft.id);
        }
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <MdRestorePage />
                    {t('campaign.drafts')}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {drafts && drafts.length > 0 ? (
                    drafts?.map((draft) => (
                        <div key={draft.id} className="modal-group">
                            <div className="d-flex flex-row align-items-center justify-content-between gap-3 modal-group-content">
                                {/* Brouillon */}
                                <div className="d-flex flex-column">
                                    <div className="d-flex gap-2 align-items-center">
                                        {/* Date et heure */}
                                        {getLocalizedDateAndTime(draft.date)}

                                        {/* Indicateur nouvelle histoire */}
                                        {!draft?.storyId && (
                                            <Badge pill bg="warning">
                                                {t('campaign.newStory')}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="draft-modal-text">
                                        {draft.text.length > 100 ? draft.text.substring(0, 130) + '...' : draft.text}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="d-flex gap-2">
                                    {/* Suppression */}
                                    <Button
                                        variant="outline-icon-action"
                                        className="draft-modal-button-delete"
                                        onClick={() => handleDeleteDraft(draft.id)}
                                    >
                                        <FaTrashCan />
                                    </Button>

                                    {/* Injection */}
                                    <Button
                                        variant="outline-icon-action"
                                        className="draft-modal-button-inject"
                                        onClick={() => handleEditDraft(draft)}
                                    >
                                        <FaArrowRight />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="modal-group">
                        <div className="modal-group-content">{t('campaign.noDrafts')}</div>
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
                    <Button type="button" variant="outline-text-action" onClick={() => onClose()} disabled={isSubmitting}>
                        {t('common.close')}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default DraftsModal;
