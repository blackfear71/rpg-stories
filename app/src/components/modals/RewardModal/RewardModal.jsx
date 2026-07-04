import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaGift, FaTrashCan } from 'react-icons/fa6';
import { PiListStarBold } from 'react-icons/pi';

import { SelectInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import './RewardModal.css';

/**
 * Modale récompense
 */
const RewardModal = ({ rights, player, gifts, formData, modalOptions, setModalOptions, onClose, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Constantes
    const obtainableGifts = gifts.filter((g) => g.remainingQuantity > 0 && g.value <= player.points);

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
            giftId: e.target.value === '' ? null : parseInt(e.target.value)
        }));
    };

    /**
     * Ouvre la modale de suppression d'attribution de cadeau
     * @param {*} reward Cadeau du participant
     */
    const handleDelete = (reward) => {
        // Fermeture de la modale des cadeaux du joueur
        onClose();

        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deleteReward', { gift: reward.giftName, player: player.name }),
            action: 'deleteReward',
            data: reward.id
        });
    };

    /**
     * Renvoie une liste de cadeaux sélectionnables
     */
    const getGiftOptions = () => {
        return obtainableGifts.map((g) => ({
            key: g.id,
            value: g.id,
            label: `${g.name} • ${g.value} ${t('edition.points').toLowerCase()} (${g.remainingQuantity} ${g.remainingQuantity === 1 ? t('edition.remaining') : t('edition.remainings')})`
        }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaGift />
                            {rights.isAdminOrSuperAdminOnEdition ? t('edition.manageGifts') : t('edition.informations')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Participant */}
                        <div className="d-flex align-items-center gap-2 p-2 reward-modal-player">
                            <div
                                className="d-flex align-items-center justify-content-center reward-modal-icon"
                                style={{ backgroundColor: player.color }}
                            >
                                {player.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="reward-modal-player-name">{player.name}</div>
                        </div>

                        {/* Statistiques */}
                        <div className="modal-statistics">
                            {/* Points */}
                            <div className="modal-group-content">
                                {/* Titre */}
                                <div className="modal-group-content-title">{t('edition.points')}</div>

                                {/* Valeur */}
                                <div className={`modal-group-content-value ${player?.points > 0 ? 'green' : 'gray'}`}>
                                    {player?.points ?? 0}
                                </div>
                            </div>

                            {/* Cadeaux */}
                            <div className="modal-group-content">
                                {/* Titre */}
                                <div className="modal-group-content-title">{t('edition.gifts')}</div>

                                {/* Valeur */}
                                <div className={`modal-group-content-value ${player?.rewards?.length > 0 ? 'gold' : 'gray'}`}>
                                    {player?.rewards?.length ?? 0}
                                </div>
                            </div>
                        </div>

                        {/* Attribution cadeaux */}
                        {rights.isAdminOrSuperAdminOnEdition && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    {gifts.length > 0 ? (
                                        obtainableGifts.length > 0 ? (
                                            <SelectInput
                                                title={t('edition.giveGift')}
                                                icon={<PiListStarBold />}
                                                name={'gift'}
                                                defaultOption={{ key: 0, value: '', label: t('edition.chooseGift') }}
                                                options={getGiftOptions()}
                                                value={formData.values.giftId}
                                                onChange={handleChangeSelect}
                                                error={formData.submitCount > 0 && formData.errors.giftId}
                                                required={true}
                                            />
                                        ) : (
                                            <div className="p-2 modal-empty">{t('edition.notEnoughPoints')}</div>
                                        )
                                    ) : (
                                        <div className="p-2 modal-empty">{t('edition.noAvailableGifts')}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cadeaux obtenus */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                {/* Titre */}
                                <div className="modal-group-content-title">{t('edition.obtainedGifts')}</div>

                                {/* Liste */}
                                {player?.rewards?.length > 0 ? (
                                    <>
                                        {player.rewards.map((r) => (
                                            <div
                                                key={r.id}
                                                className="d-flex align-items-center justify-content-between pt-2 pb-2 gap-2 reward-modal-gift-row"
                                            >
                                                <div className="reward-modal-gift-name">{r.giftName}</div>
                                                {rights.isSuperAdmin && (
                                                    <Button
                                                        onClick={() => handleDelete(r)}
                                                        className="d-flex align-items-center justify-content-center modal-button-delete"
                                                        disabled={isSubmitting}
                                                    >
                                                        <FaTrashCan />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="p-2 mt-2 modal-empty">{t('edition.noObtainedGifts')}</div>
                                )}
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

                            {rights.isAdminOrSuperAdminOnEdition && obtainableGifts.length > 0 && (
                                <SpinnerButton label={t('common.validate')} isSubmitting={isSubmitting} />
                            )}
                        </div>
                    </Modal.Footer>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default RewardModal;
