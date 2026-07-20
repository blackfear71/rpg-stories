import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { MdDelete, MdEdit } from 'react-icons/md';

import { StoryEntry } from '../../../components/features';
import { TooltipButton } from '../../../components/shared';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

import './Story.css';

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

    /**
     * Formate le texte selon les balises
     * @param {*} text Texte à formater
     * @returns Texte formaté
     */
    const renderFormattedText = (text) => {
        const tagLabels = {
            EXPLORATION: 'campaign.exploration',
            COMBAT: 'campaign.combat'
        };

        // Découpage du texte selon les balises
        const parts = text.split(/(<\/?(?:EXPLORATION|COMBAT)>)/g);

        return parts.map((part, index) => {
            const match = part.match(/^<(\/?)(\w+)>$/);

            if (match) {
                const tagName = match[2];
                const label = tagLabels[tagName];

                // Balise reconnue : titre formaté
                if (label) {
                    return (
                        <div key={index} className="story-text-highlight">
                            {t(label)}
                        </div>
                    );
                }

                // Balise inconnue : ignorée
                return null;
            }

            // Nettoyage des sauts de ligne
            const cleaned = part.replace(/^\n/, '').replace(/\n$/, '');

            if (!cleaned) {
                return null;
            }

            return <div key={index}>{cleaned}</div>;
        });
    };

    return (
        <>
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
                <div className="d-flex flex-column rounded story-container">
                    {/* Date & boutons d'actions */}
                    <div className="d-flex align-items-center justify-content-between story-header">
                        <span className="px-3 py-2 story-header-date">{getLocalizedDate(story.createdAt)}</span>

                        <span className="d-flex flex-row align-items-center px-3 py-2 gap-2">
                            {/* TODO : icônes ? */}
                            <TooltipButton
                                tooltip={t('common.delete')}
                                icon={<MdDelete size={20} />}
                                onClick={() => onConfirm(story.id, story.createdAt)}
                                isSubmitting={isSubmitting}
                            />

                            {!inputOptions.isOpen && (
                                <TooltipButton
                                    tooltip={t('common.update')}
                                    icon={<MdEdit size={20} />}
                                    onClick={() => onOpenClose(EnumAction.UPDATE, story.id)}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </span>
                    </div>

                    {/* Histoire */}
                    <div className="p-3 story-text">{renderFormattedText(story.story)}</div>
                </div>
            )}
        </>
    );
};

export default Story;
