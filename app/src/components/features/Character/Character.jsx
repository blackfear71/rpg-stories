import { useTranslation } from 'react-i18next';

import { Button, Image } from 'react-bootstrap';
import { BiUnlink } from 'react-icons/bi';
import { IoAddCircleOutline, IoDuplicateOutline } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

import { EnumAction } from '../../../enums';

/**
 * Liste des campagnes
 */
const Character = ({ character, onOpenCharacter, onOpenImport, onConfirmDetach, onConfirmDelete, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Personnage */}
            {character ? (
                <>
                    {/* TODO : penser à un style différent pour les boutons */}
                    {/* Boutons */}
                    <div className="d-flex flex-wrap gap-2">
                        {/* Modification */}
                        <Button
                            variant="filled-icon-action"
                            className="d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                            onClick={() => onOpenCharacter(EnumAction.UPDATE)}
                            disabled={isSubmitting}
                        >
                            <MdEdit size={25} />
                            {t('character.updateCharacter')}
                        </Button>

                        {/* Détachement */}
                        <Button
                            variant="filled-icon-action"
                            className="d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                            onClick={onConfirmDetach}
                            disabled={isSubmitting}
                        >
                            <BiUnlink size={25} />
                            {t('character.detachCharacter')}
                        </Button>

                        {/* Suppression */}
                        <Button
                            variant="filled-icon-action"
                            className="d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                            onClick={onConfirmDelete}
                            disabled={isSubmitting}
                        >
                            <MdDelete size={25} />
                            {t('character.deleteCharacter')}
                        </Button>
                    </div>

                    {/* TODO : affichage personnage à faire */}
                    <div>
                        <div className="text-white">{character.name}</div>
                        {character.picture && (
                            <Image
                                src={`${import.meta.env.VITE_API_URL}/serve-file/characters?file=${encodeURIComponent(character.picture)}`}
                                alt={character.picture}
                                className={'w-100'}
                            />
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Boutons */}
                    <div className="d-flex gap-2">
                        {/* Création */}
                        <Button
                            variant="filled-icon-action"
                            className="d-flex align-items-center justify-content-center gap-1 w-50"
                            onClick={() => onOpenCharacter(EnumAction.CREATE)}
                            disabled={isSubmitting}
                        >
                            <IoAddCircleOutline size={25} />
                            {t('character.createCharacter')}
                        </Button>

                        {/* Import */}
                        <Button
                            variant="filled-icon-action"
                            className="d-flex align-items-center justify-content-center gap-1 w-50"
                            onClick={onOpenImport}
                            disabled={isSubmitting}
                        >
                            <IoDuplicateOutline size={25} />
                            {t('character.importCharacter')}
                        </Button>
                    </div>

                    {/* TODO : afficher message personnage vide */}
                </>
            )}
        </>
    );
};

export default Character;
