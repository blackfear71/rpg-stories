import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Modal } from 'react-bootstrap';
import { FaPeopleArrows, FaUserFriends } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';
import { PiUserListFill } from 'react-icons/pi';

import { IncrementInput, SelectInput, TextInput } from '../../../components/inputs';
import { Message, SpinnerButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Modale participant
 */
const PlayerModal = ({ rights, player, players, formData, modalOptions, setModalOptions, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    // Constantes
    const availablePlayers = player && players.filter((p) => p.id !== player.id);

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
     * @param {*} action Action à réaliser
     */
    const handleChangePoints = (action) => {
        // Ajoute ou retire des points selon les droits
        switch (action) {
            case 'add':
                formData.setValues((prev) => {
                    const currentDelta = parseInt(prev.points) || 0;
                    const nextDelta = currentDelta < 0 && !rights.isSuperAdmin ? 0 : currentDelta + 1;

                    return {
                        ...prev,
                        points: nextDelta
                    };
                });
                break;
            case 'remove':
                formData.setValues((prev) => {
                    const currentDelta = parseInt(prev.points) || 0;
                    let nextDelta;

                    if (rights.isSuperAdmin) {
                        // SUPERADMIN : peut aller en négatif, limité par les points du joueur
                        nextDelta = player ? Math.max(-player.points, currentDelta - 1) : Math.max(0, currentDelta - 1);
                    } else {
                        // Autres : jamais en dessous de 0
                        nextDelta = Math.max(0, currentDelta - 1);
                    }

                    return {
                        ...prev,
                        points: nextDelta
                    };
                });
                break;
        }
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} action Action à réaliser
     */
    const handleChangeGiveaway = (action) => {
        // Donne des points à un autre participant
        switch (action) {
            case 'add':
                formData.setValues((prev) => {
                    const currentGiveaway = parseInt(prev.giveaway) || 0;

                    return {
                        ...prev,
                        giveaway: currentGiveaway >= player.points ? currentGiveaway : currentGiveaway + 1
                    };
                });
                break;
            case 'remove':
                formData.setValues((prev) => {
                    const currentGiveaway = parseInt(prev.giveaway) || 0;

                    return {
                        ...prev,
                        giveaway: currentGiveaway <= 0 ? 0 : currentGiveaway - 1
                    };
                });
                break;
        }
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        formData.setValues((prev) => ({
            ...prev,
            giveawayPlayerId: e.target.value === '' ? null : parseInt(e.target.value)
        }));
    };

    /**
     * Renvoie une liste de participants sélectionnables
     */
    const getGivewayOptions = () => {
        return availablePlayers.map((p) => ({
            key: p.id,
            value: p.id,
            label: `${p.name} • ${p.points} ${t('edition.points').toLowerCase()}`
        }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUser />
                            {modalOptions.action === EnumAction.CREATE ? t('edition.addPlayer') : t('edition.managePlayer')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Nombre de points */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    {/* Titre */}
                                    <div className="modal-group-content-title">{t('edition.points')}</div>

                                    {/* Valeur */}
                                    <div className={`modal-group-content-value ${player?.points > 0 ? 'green' : 'gray'}`}>
                                        {player?.points ?? 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modification du participant */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={modalOptions.action === EnumAction.CREATE ? t('edition.name') : t('edition.updateName')}
                                    icon={<PiUserListFill />}
                                    name="name"
                                    ref={nameInputRef}
                                    placeholder={t('edition.name')}
                                    value={formData.values.name}
                                    onChange={formData.handleChange}
                                    error={formData.submitCount > 0 && formData.errors.name}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Attribution des points */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <IncrementInput
                                    title={t('edition.givePoints')}
                                    icon={<GiTwoCoins />}
                                    name={'points'}
                                    value={formData.values.points}
                                    onChangeDown={() => handleChangePoints('remove')}
                                    onChangeUp={() => handleChangePoints('add')}
                                    error={formData.submitCount > 0 && formData.errors.points}
                                />
                            </div>
                        </div>

                        {/* Don de points */}
                        {modalOptions.action === EnumAction.UPDATE && player?.points > 0 && availablePlayers.length > 0 && (
                            <div className="modal-group">
                                <div className="modal-group-content gap-2">
                                    {/* Choix du participant */}
                                    <SelectInput
                                        title={t('edition.giveParticipant')}
                                        icon={<FaUserFriends />}
                                        name={'playerGiveaway'}
                                        defaultOption={{ key: 0, value: '', label: t('edition.chooseParticipant') }}
                                        options={getGivewayOptions()}
                                        value={formData.values.giveawayPlayerId}
                                        onChange={handleChangeSelect}
                                        error={formData.submitCount > 0 && formData.errors.giveawayPlayerId}
                                    />

                                    {/* Nombre de points */}
                                    <IncrementInput
                                        icon={<FaPeopleArrows />}
                                        name={'giftGiveaway'}
                                        value={formData.values.giveaway}
                                        onChangeDown={() => handleChangeGiveaway('remove')}
                                        onChangeUp={() => handleChangeGiveaway('add')}
                                        error={formData.submitCount > 0 && formData.errors.giveaway}
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

export default PlayerModal;
