import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaGift } from 'react-icons/fa6';
import { GiCardboardBox } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';
import { IoGiftSharp } from 'react-icons/io5';

import { TextInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Modale cadeau
 */
const GiftModal = ({ gift, formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        // Focus à la création
        if (modalOptions?.isOpen) {
            modalOptions.action === EnumAction.CREATE && nameInputRef.current?.focus();
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
     * @param {*} e Evènement
     */
    const handleChangeNumeric = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;

        if (/^\d*$/.test(value)) {
            formData.setValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaGift />
                            {modalOptions.action === EnumAction.CREATE ? t('edition.addGift') : t('edition.manageGift')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Statistiques */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="modal-statistics">
                                {/* Cadeaux restants */}
                                <div className="modal-group-content">
                                    {/* Titre */}
                                    <div className="modal-group-content-title">{t('edition.remainingGifts')}</div>

                                    {/* Valeur */}
                                    <div className={`modal-group-content-value ${gift?.remainingQuantity > 0 ? 'gold' : 'gray'}`}>
                                        {gift?.remainingQuantity ?? 0}
                                    </div>
                                </div>

                                {/* Cadeaux attribués */}
                                <div className="modal-group-content">
                                    {/* Titre */}
                                    <div className="modal-group-content-title">{t('edition.assignedGifts')}</div>

                                    {/* Valeur */}
                                    <div
                                        className={`modal-group-content-value ${gift && gift.quantity - gift.remainingQuantity > 0 ? 'green' : 'gray'}`}
                                    >
                                        {gift ? gift.quantity - gift.remainingQuantity : 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formulaire */}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Nom */}
                                <TextInput
                                    title={t('edition.name')}
                                    icon={<IoGiftSharp />}
                                    name="name"
                                    ref={nameInputRef}
                                    placeholder={t('edition.name')}
                                    value={formData.values.name}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.name}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Valeur */}
                                <TextInput
                                    title={t('edition.value')}
                                    icon={<GrMoney />}
                                    name="value"
                                    placeholder={t('edition.value')}
                                    value={formData.values.value}
                                    onChange={handleChangeNumeric}
                                    error={formData.submitCount > 0 && formData.errors.value}
                                    maxLength={10}
                                    inputMode={'numeric'}
                                    pattern={'[0-9]*'}
                                    required={true}
                                />

                                {/* Quantité */}
                                <TextInput
                                    title={t('edition.quantity')}
                                    icon={<GiCardboardBox />}
                                    name="quantity"
                                    placeholder={t('edition.quantity')}
                                    value={formData.values.quantity}
                                    onChange={handleChangeNumeric}
                                    error={formData.submitCount > 0 && formData.errors.quantity}
                                    maxLength={10}
                                    inputMode={'numeric'}
                                    pattern={'[0-9]*'}
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

export default GiftModal;
