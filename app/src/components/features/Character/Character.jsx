import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { IoAddCircleOutline, IoDuplicateOutline } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

import { EnumAction } from '../../../enums';

/**
 * Liste des campagnes
 */
const Character = ({ character, onOpenCharacter, onOpenImport, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Boutons */}
            {character ? (
                <div className="d-flex gap-2">
                    {/* Modification */}
                    <Button
                        variant="filled-icon-action"
                        className="d-flex align-items-center justify-content-center gap-1 w-50"
                        onClick={() => onOpenCharacter(EnumAction.UPDATE)}
                        disabled={isSubmitting}
                    >
                        <MdEdit size={30} />
                        {t('character.updateCharacter')}
                    </Button>

                    {/* Détachement */}
                    {/* TODO : bouton pour détacher (sans suppression, modale confirmation, adapter pour avoir 3 boutons) */}

                    {/* Suppression */}
                    <Button
                        variant="filled-icon-action"
                        className="d-flex align-items-center justify-content-center gap-1 w-50"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        <MdDelete size={30} />
                        {t('character.deleteCharacter')}
                    </Button>

                    {/* TODO : affichage personnage à faire */}
                </div>
            ) : (
                <div className="d-flex gap-2">
                    {/* Création */}
                    <Button
                        variant="filled-icon-action"
                        className="d-flex align-items-center justify-content-center gap-1 w-50"
                        onClick={() => onOpenCharacter(EnumAction.CREATE)}
                        disabled={isSubmitting}
                    >
                        <IoAddCircleOutline size={30} />
                        {t('character.createCharacter')}
                    </Button>

                    {/* Rattachement */}
                    <Button
                        variant="filled-icon-action"
                        className="d-flex align-items-center justify-content-center gap-1 w-50"
                        onClick={onOpenImport}
                        disabled={isSubmitting}
                    >
                        <IoDuplicateOutline size={30} />
                        {t('character.importCharacter')}
                    </Button>
                </div>
            )}
        </>
    );
};

export default Character;
