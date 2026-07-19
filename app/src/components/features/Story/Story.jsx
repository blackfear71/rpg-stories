import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';

import { StoryEntry } from '../../../components/features';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

/**
 * Liste des histoires
 */
const Story = ({ story, formData, inputOptions, onConfirm, onOpenClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const storyInputRef = useRef(null);

    /**
     * Met le focus sur le champ "histoire" à l'ouverture de la saisie
     */
    useEffect(() => {
        // Focus à la modification
        inputOptions?.isOpen &&
            inputOptions?.action === EnumAction.UPDATE &&
            inputOptions?.sstoryId === story.id &&
            storyInputRef.current?.focus();
    }, [inputOptions?.isOpen]);

    return (
        <>
            {/* TODO : style à finir */}

            {/* Saisie ou affichage */}
            {inputOptions.isOpen && inputOptions.action === EnumAction.UPDATE && inputOptions.storyId === story.id ? (
                <StoryEntry
                    story={story}
                    formData={formData}
                    inputOptions={inputOptions}
                    onOpenClose={onOpenClose}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <div className="d-flex flex-column ps-2 pe-2 todo-supprimer bg-white">
                    {/* Date & boutons d'actions */}
                    <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                        <span className="table-card-line-label">{getLocalizedDate(story.createdAt)}</span>

                        <span className="table-card-line-value">
                            {/* TODO : trads */}
                            <Button onClick={() => onConfirm(story.id, story.createdAt)} disabled={isSubmitting}>
                                SUPPRIMER
                            </Button>

                            {!inputOptions.isOpen && (
                                <Button onClick={() => onOpenClose(EnumAction.UPDATE, story.id)} disabled={isSubmitting}>
                                    MODIFIER
                                </Button>
                            )}
                        </span>
                    </div>

                    {/* Histoire */}
                    <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                        <span className="table-card-line-label">{story.story}</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default Story;
