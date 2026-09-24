import { useTranslation } from 'react-i18next';

import { Image } from 'react-bootstrap';
import { BiUnlink } from 'react-icons/bi';
import { GiBlackKnightHelm } from 'react-icons/gi';
import { MdDelete, MdEdit } from 'react-icons/md';

import { TooltipButton } from '../../../components/shared';

import { EnumAction } from '../../../enums';

import './Character.css';

/**
 * Liste des campagnes
 */
const Character = ({ character, onOpenCharacterModal, onConfirmDetach, onConfirmDelete, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <div className="d-flex justify-content-center w-100">
            {/* Personnage */}
            {character ? (
                <div className="d-flex flex-column align-items-center gap-3 p-3 rounded character-container">
                    {/* Image */}
                    <div className="d-flex align-items-center justify-content-center character-icon">
                        {character.picture ? (
                            <Image
                                src={`${import.meta.env.VITE_API_URL}/serve-file/characters?file=${encodeURIComponent(character.picture)}`}
                                alt={character.picture}
                            />
                        ) : (
                            <GiBlackKnightHelm size={70} />
                        )}
                    </div>

                    {/* Boutons */}
                    <div className="d-flex flex-wrap gap-2">
                        {/* Modification */}
                        <TooltipButton
                            tooltip={t('character.updateCharacter')}
                            content={<MdEdit size={25} />}
                            variant="outline-icon-action"
                            className="character-button"
                            onClick={() => onOpenCharacterModal(EnumAction.UPDATE)}
                            isSubmitting={isSubmitting}
                        />

                        {/* Détachement */}
                        <TooltipButton
                            tooltip={t('character.detachCharacter')}
                            content={<BiUnlink size={25} />}
                            variant="outline-icon-action"
                            className="character-button"
                            onClick={onConfirmDetach}
                            isSubmitting={isSubmitting}
                        />

                        {/* Suppression */}
                        <TooltipButton
                            tooltip={t('character.deleteCharacter')}
                            content={<MdDelete size={25} />}
                            variant="outline-icon-action"
                            className="character-button"
                            onClick={onConfirmDelete}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                    {/* Nom */}
                    <div className="p-2 rounded character-name">{character.name}</div>
                </div>
            ) : (
                <div className="w-100 px-2 py-3 page-empty">{t('character.noCharacter')}</div>
            )}
        </div>
    );
};

export default Character;
