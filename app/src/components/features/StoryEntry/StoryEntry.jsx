import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form } from 'react-bootstrap';
import { GiAxeSword, GiBookmarklet, GiCampfire, GiCompass } from 'react-icons/gi';

import { TextareaInput } from '../../../components/inputs';
import { SpinnerButton, TooltipButton } from '../../../components/shared';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction, EnumContext } from '../../../enums';

import './StoryEntry.css';

/**
 * Liste des histoires
 */
const StoryEntry = ({ story = null, formData, inputOptions, onOpenClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const storyInputRef = useRef(null);

    // Constantes
    const tags = [
        { code: EnumContext.EXPLORATION, label: 'campaign.exploration', icon: <GiCompass size={20} /> },
        { code: EnumContext.COMBAT, label: 'campaign.fight', icon: <GiAxeSword size={20} /> },
        { code: EnumContext.REPOS, label: 'campaign.rest', icon: <GiCampfire size={20} /> }
    ];

    /**
     * Met le focus sur le champ "histoire" à l'ouverture de la saisie
     */
    useEffect(() => {
        // Focus à la création
        inputOptions?.isOpen && storyInputRef.current?.focus();
    }, [inputOptions?.isOpen]);

    /**
     * Insère une balise custom à la position du curseur dans le textarea, puis repositionne le curseur juste après la balise
     * @param {*} tag Nom de la balise à insérer
     */
    const insertTag = (tag) => {
        const textarea = storyInputRef.current;

        // Sécurité : évite un crash si le ref n'est pas encore attaché au DOM
        if (!textarea) {
            return;
        }

        const tagText = `<${tag}>`;

        // Position du curseur (ou de la sélection) au moment du clic sur le bouton, on mémorise aussi le scroll actuel du textarea
        const { selectionStart, selectionEnd, value, scrollTop } = textarea;

        // Reconstruit le texte en insérant la balise entre les deux morceaux découpés à la position du curseur (si du texte était sélectionné, il est remplacé par la balise)
        const newValue = value.slice(0, selectionStart) + tagText + value.slice(selectionEnd);

        // Met à jour la valeur Formik
        formData.setFieldValue('story', newValue);

        // Replace le curseur juste après la balise insérée (après le re-render)
        requestAnimationFrame(() => {
            const cursorPosition = selectionStart + tagText.length;

            // preventScroll empêche le navigateur de scroller la page/le textarea au focus
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(cursorPosition, cursorPosition);

            // Filet de sécurité pour les navigateurs qui ignorent preventScroll (vieux Safari iOS)
            textarea.scrollTop = scrollTop;
        });
    };

    return (
        <>
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <div className="d-flex flex-column rounded gap-1">
                        {/* Entête */}
                        <div className="d-flex align-items-center justify-content-between">
                            {/* Date */}
                            <span className="d-flex align-items-center gap-1 story-entry-header-date">
                                <GiBookmarklet size={32} className="story-header-icon" />
                                {getLocalizedDate(story && inputOptions.action === EnumAction.UPDATE ? story.createdAt : new Date())}
                            </span>

                            {/* Boutons de contexte */}
                            <span className="d-flex flex-row align-items-center gap-1 story-entry-header-actions">
                                {tags.map((tag) => (
                                    <TooltipButton
                                        key={tag.code}
                                        tooltip={t(tag.label)}
                                        content={
                                            <div className="d-flex flew-row align-items-center rounded gap-1">
                                                {tag.icon}
                                                <span className="story-entry-header-button-label">{t(tag.label)}</span>
                                            </div>
                                        }
                                        className={`story-entry-header-button story-entry-header-button-${tag.code.toLowerCase()}`}
                                        onClick={() => insertTag(tag.code)}
                                        isSubmitting={isSubmitting}
                                    />
                                ))}
                            </span>
                        </div>

                        {/* Saisie */}
                        <div className="d-flex flex-column gap-2 ms-3">
                            {/* Histoire */}
                            <TextareaInput
                                name={'story'}
                                ref={storyInputRef}
                                placeholder={t('campaign.story')}
                                value={formData.values.story}
                                onChange={formData.handleChange}
                            />

                            {/* Boutons d'action */}
                            <div className="d-flex flex-row gap-2 justify-content-end">
                                <Button variant={'input-action'} onClick={onOpenClose} disabled={isSubmitting}>
                                    {t('common.cancel')}
                                </Button>

                                <SpinnerButton variant={'input-action'} label={t('common.validate')} isSubmitting={isSubmitting} />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </Form>
        </>
    );
};

export default StoryEntry;
