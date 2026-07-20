import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form } from 'react-bootstrap';

import { TextareaInput } from '../../../components/inputs';
import { SpinnerButton } from '../../../components/shared';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

import '../Story/Story.css';

/**
 * Liste des histoires
 */
const StoryEntry = ({ story = null, formData, inputOptions, onOpenClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const storyInputRef = useRef(null);

    // Constantes
    const tags = ['COMBAT', 'EXPLORATION'];

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

        // Position du curseur (ou de la sélection) au moment du clic sur le bouton
        const { selectionStart, selectionEnd, value } = textarea;

        // Reconstruit le texte en insérant la balise entre les deux morceaux découpés à la position du curseur (si du texte était sélectionné, il est remplacé par la balise)
        const newValue = value.slice(0, selectionStart) + tagText + value.slice(selectionEnd);

        // Met à jour la valeur Formik
        formData.setFieldValue('story', newValue);

        // Replace le curseur juste après la balise insérée (après le re-render)
        requestAnimationFrame(() => {
            const cursorPosition = selectionStart + tagText.length;
            textarea.focus();
            textarea.setSelectionRange(cursorPosition, cursorPosition);
        });
    };

    return (
        <>
            <Form onSubmit={formData.handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <div className="d-flex flex-column rounded story-container">
                        {/* Date & boutons de contexte */}
                        <div className="d-flex align-items-center justify-content-between story-header">
                            <span className="px-3 py-2 story-header-date">
                                {getLocalizedDate(story && inputOptions.action === EnumAction.UPDATE ? story.createdAt : new Date())}
                            </span>

                            <span className="d-flex flex-row align-items-center px-3 py-2 gap-2">
                                {tags.map((tag) => (
                                    <Button
                                        key={tag}
                                        variant="outline-action"
                                        className="story-header-tag"
                                        onClick={() => insertTag(tag)}
                                        disabled={isSubmitting}
                                    >
                                        {`<${tag}>`}
                                    </Button>
                                ))}
                            </span>
                        </div>

                        {/* Saisie histoire */}
                        <div className="p-3">
                            <TextareaInput
                                name={'story'}
                                ref={storyInputRef}
                                placeholder={t('campaign.story')}
                                value={formData.values.story}
                                onChange={formData.handleChange}
                            />
                        </div>

                        {/* Annuler & Valider */}
                        <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                            <span className="table-card-line-value">
                                {/* TODO : trads */}
                                <Button onClick={onOpenClose} disabled={isSubmitting}>
                                    ANNULER
                                </Button>

                                <SpinnerButton variant={'action'} label={'VALIDER'} isSubmitting={isSubmitting} />
                            </span>
                        </div>
                    </div>
                </fieldset>
            </Form>
        </>
    );
};

export default StoryEntry;
