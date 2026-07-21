import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { GiAxeSword, GiCampfire, GiCompass } from 'react-icons/gi';
import { IoCalendarOutline } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

import { StoryEntry } from '../../../components/features';
import { TooltipButton } from '../../../components/shared';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction, EnumContext } from '../../../enums';

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
    /**
     * Formate le texte selon les balises
     * @param {*} text Texte à formater
     * @returns Texte formaté
     */
    const renderStory = (text) => {
        const tags = [
            { code: EnumContext.EXPLORATION, label: 'campaign.exploration', icon: <GiCompass size={20} /> },
            { code: EnumContext.COMBAT, label: 'campaign.fight', icon: <GiAxeSword size={20} /> },
            { code: EnumContext.REPOS, label: 'campaign.rest', icon: <GiCampfire size={20} /> }
        ];

        // Construit dynamiquement la Regex à partir des codes des tags
        const tagNames = tags.map((tag) => tag.code).join('|');
        const tagRegex = new RegExp(`(<\\/?(?:${tagNames})>)`, 'g');

        // Découpage du texte selon les balises
        const parts = text.split(tagRegex);

        return parts.map((part, index) => {
            const match = part.match(/^<(\/?)(\w+)>$/);

            if (match) {
                const tagName = match[2];
                const tag = tags.find((f) => f.code === tagName);
                const label = tag?.label;
                const icon = tag?.icon;

                // Balise reconnue, le titre est formaté
                if (label) {
                    return (
                        <div key={index} className="d-flex flew-row align-items-center rounded p-2 my-1 gap-1 story-text-highlight">
                            {icon} {t(label)}
                        </div>
                    );
                }
            }

            // Ne retire que le \n technique juste après la balise (pas celui avant, qui sépare le texte du titre suivant)
            const cleaned = part.replace(/^\n/, '');

            if (!cleaned) {
                return null;
            }

            // Texte normal ou balise non reconnue
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
                    {/* Entête */}
                    <div className="d-flex align-items-center justify-content-between story-header">
                        {/* Date */}
                        <span className="d-flex align-items-center gap-2 px-3 py-2 story-header-date">
                            <IoCalendarOutline size={20} />
                            {getLocalizedDate(story.createdAt)}
                        </span>

                        {/* Boutons d'action */}
                        <span className="d-flex flex-row align-items-center px-3 py-2 gap-2">
                            <TooltipButton
                                tooltip={t('common.delete')}
                                content={<MdDelete size={20} />}
                                onClick={() => onConfirm(story.id, getLocalizedDate(story.createdAt))}
                                isSubmitting={isSubmitting}
                            />

                            {!inputOptions.isOpen && (
                                <TooltipButton
                                    tooltip={t('common.update')}
                                    content={<MdEdit size={20} />}
                                    onClick={() => onOpenClose(EnumAction.UPDATE, story.id)}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </span>
                    </div>

                    {/* Histoire */}
                    <div className="p-2 story-text">{renderStory(story.story)}</div>
                </div>
            )}
        </>
    );
};

export default Story;
