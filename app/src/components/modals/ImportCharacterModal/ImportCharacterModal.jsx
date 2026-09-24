import { useTranslation } from 'react-i18next';

import { Button, Image, Modal } from 'react-bootstrap';
import { BiLink } from 'react-icons/bi';
import { FaArrowRight } from 'react-icons/fa6';
import { GiBlackKnightHelm } from 'react-icons/gi';

import './ImportCharacterModal.css';

import { Message } from '../../shared';

/**
 * Modale campagne
 */
const ImportCharacterModal = ({ characters, modalOptions, setModalOptions, onSelectCharacter, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <BiLink />
                    {t('character.importCharacter')}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {characters && characters.length > 0 ? (
                    <>
                        {/* Brouillons */}
                        {characters?.map((character) => (
                            <div key={character.id} className="modal-group">
                                <div className="d-flex flex-row align-items-center justify-content-between gap-3 modal-group-content">
                                    {/* Personnage */}
                                    <div className="d-flex gap-2 align-items-center">
                                        {/* Image */}
                                        <div className="d-flex align-items-center justify-content-center import-character-modal-icon">
                                            {character.picture ? (
                                                <Image
                                                    src={`${import.meta.env.VITE_API_URL}/serve-file/characters?file=${encodeURIComponent(character.picture)}`}
                                                    alt={character.picture}
                                                />
                                            ) : (
                                                <GiBlackKnightHelm size={20} />
                                            )}
                                        </div>

                                        {/* Nom */}
                                        <span className="import-character-modal-name">{character.name}</span>
                                    </div>

                                    {/* Bouton de sélection */}
                                    <Button
                                        variant="outline-icon-action"
                                        className="import-character-modal-button-inject"
                                        onClick={() => onSelectCharacter(character.id)}
                                        disabled={isSubmitting}
                                    >
                                        <FaArrowRight />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="modal-group">
                        <div className="modal-group-content">
                            <div className="p-2 mt-2 modal-empty">{t('character.noCharacters')}</div>
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
                            inline={true}
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

export default ImportCharacterModal;
