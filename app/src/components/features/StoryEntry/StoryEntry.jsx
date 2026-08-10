import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form } from 'react-bootstrap';
import { GiAxeSword, GiBeerStein, GiBookmarklet, GiCampfire, GiCompass } from 'react-icons/gi';
import { MdEmojiSymbols } from 'react-icons/md';

import { TextareaInput } from '../../../components/inputs';
import { SpinnerButton, TooltipButton } from '../../../components/shared';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction, EnumContext } from '../../../enums';

import './StoryEntry.css';

// Symboles
const actions = ['🔒', '🔓', '🗝️', '🔍', '🕯️', '🪜', '⛓️', '🪏', '⚔️', '🏹', '🛡️', '🩸', '🔥'];
const animals = ['👣', '🐾', '🐺', '🐕', '🐈', '🐎', '🐄', '🐖', '🐦‍⬛', '🕷️', '🕸️', '🐦‍🔥', '🐉', '🐊', '🦈', '🐋', '🐚'];
const arrows = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↩️', '🔃'];
const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪'];
const digits = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const emojis = ['🎲', '💬', '📖', '📕', '📗', '📘', '📙', '📜', '🤴', '👸', '☠️', '🪦', '⌛', '💰', '🎶'];
const food = ['🍇', '🥕', '🍄‍🟫', '🌶️', '🥖', '🍖', '🍗', '🍺', '🍷'];
const nature = ['🌳', '💧', '❄️', '🌧️', '🌩️', '🌫️', '☀️', '🌔', '⭐', '🌊', '⛵', '⛺', '📍', '🧭', '🏔️'];

/**
 * Saisie d'une histoire
 */
const StoryEntry = ({ story = null, formData, draftsState, inputOptions, onOpenClose, renderNavigation, setMessage, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const storyInputRef = useRef(null);
    const symbolsButtonRef = useRef(null);
    const symbolsPanelRef = useRef(null);
    const [localDraftId] = useState(() => inputOptions?.draftId || crypto.randomUUID());
    const [showSymbols, setShowSymbols] = useState(false);

    // Contexte
    const { deleteDraft, getDraftById, saveDraft } = draftsState;

    // Constantes
    const symbols = [
        { id: 'digits', icons: digits },
        { id: 'arrows', icons: arrows },
        { id: 'colors', icons: colors },
        { id: 'emojis', icons: emojis },
        { id: 'actions', icons: actions },
        { id: 'nature', icons: nature },
        { id: 'food', icons: food },
        { id: 'animals', icons: animals }
    ];
    const tags = [
        { code: EnumContext.EXPLORATION, label: 'campaign.exploration', icon: <GiCompass size={20} /> },
        { code: EnumContext.COMBAT, label: 'campaign.fight', icon: <GiAxeSword size={20} /> },
        { code: EnumContext.PAUSE, label: 'campaign.pause', icon: <GiBeerStein size={20} /> },
        { code: EnumContext.REPOS, label: 'campaign.rest', icon: <GiCampfire size={20} /> }
    ];

    /**
     * Lancement initial du composant
     */
    useEffect(() => {
        // Si on a un brouillon on le charge dans le formulaire, sinon on en créé un nouveau
        inputOptions?.draftId && loadDraft();

        // Création d'un évènement de sauvegarde si l'onglet est masqué ou la page quittée
        const handler = () => {
            if (document.visibilityState === 'hidden') {
                autoSave();
            }
        };

        document.addEventListener('visibilitychange', handler);
        window.addEventListener('pagehide', autoSave);

        return () => {
            document.removeEventListener('visibilitychange', handler);
            window.removeEventListener('pagehide', autoSave);
        };
    }, []);

    /**
     * Met le focus sur le champ "histoire" à l'ouverture de la saisie
     */
    useEffect(() => {
        // Focus à l'ouverture de la saisie
        if (inputOptions?.isOpen) {
            requestAnimationFrame(moveCursorToEnd);
        }
    }, [inputOptions?.isOpen]);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        if (!showSymbols) {
            return;
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSymbols]);

    /**
     * Sauvegarde après une pause de frappe (3s)
     */
    useEffect(() => {
        const timer = setTimeout(autoSave, 3000);
        return () => clearTimeout(timer);
    }, [formData.values.story]);

    /**
     * Charge un brouillon dans le formulaire
     */
    const loadDraft = async () => {
        if (inputOptions?.draftId) {
            try {
                const draft = await getDraftById(inputOptions.draftId);

                if (draft) {
                    formData.setFieldValue('story', draft.text);

                    // Repositionne le curseur une fois le texte du brouillon chargé
                    requestAnimationFrame(moveCursorToEnd);
                }
            } catch (err) {
                setMessage(err);
            }
        }
    };

    /**
     * Positionne le curseur à la fin du texte et scrolle le textarea jusqu'en bas
     */
    const moveCursorToEnd = () => {
        const textarea = storyInputRef.current;

        if (!textarea) {
            return;
        }

        const length = textarea.value.length;

        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(length, length);
        textarea.scrollTop = textarea.scrollHeight;
    };

    /**
     * Ferme la fenêtre des symboles au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        const clickedButton = symbolsButtonRef.current?.contains(e.target);
        const clickedPanel = symbolsPanelRef.current?.contains(e.target);

        if (!clickedButton && !clickedPanel) {
            setShowSymbols(false);
        }
    };

    /**
     * Sauvegarde automatique du brouillon
     */
    const autoSave = async () => {
        try {
            await saveDraft({ draftId: localDraftId, storyId: story?.id ?? null, text: formData.values.story });
        } catch (err) {
            setMessage(err);
        }
    };

    /**
     * Insertion d'un symbole
     * @param {*} symbol Symbole à insérer
     */
    const handleInsertSymbol = (symbol) => {
        // Insertion symbole
        insertAtCursor(symbol);

        // Fermeture fenêtre des symboles
        setShowSymbols(false);
    };

    /**
     * Insère du texte à la position du curseur dans le textarea, puis repositionne le curseur juste après
     * @param {*} text Texte à insérer
     */
    const insertAtCursor = (text) => {
        const textarea = storyInputRef.current;

        // Sécurité : évite un crash si le ref n'est pas encore attaché au DOM
        if (!textarea) {
            return;
        }

        // Position du curseur (ou de la sélection) au moment du clic sur le bouton, on mémorise aussi le scroll actuel du textarea
        const { selectionStart, selectionEnd, value, scrollTop } = textarea;

        // Reconstruit le texte en insérant le texte entre les deux morceaux découpés à la position du curseur (si du texte était sélectionné, il est remplacé)
        const newValue = value.slice(0, selectionStart) + text + value.slice(selectionEnd);

        // Met à jour la valeur Formik
        formData.setFieldValue('story', newValue);

        // Replace le curseur juste après le texte inséré (après le re-render)
        requestAnimationFrame(() => {
            const cursorPosition = selectionStart + text.length;

            // preventScroll empêche le navigateur de scroller la page/le textarea au focus
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(cursorPosition, cursorPosition);

            // Filet de sécurité pour les navigateurs qui ignorent preventScroll (vieux Safari iOS)
            textarea.scrollTop = scrollTop;
        });
    };

    /**
     * Insère une balise custom à la position du curseur
     * @param {*} tag Nom de la balise à insérer
     */
    const insertTag = (tag) => insertAtCursor(`<${tag}>`);

    /**
     * Ouvre ou ferme le panneau de symboles
     */
    const handleShowSymbols = () => {
        setShowSymbols((prev) => !prev);
    };

    /**
     * Soumet le formulaire
     * @param {*} e Evènement
     */
    const handleSubmit = async (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        try {
            // Si un brouillon existe alors on le supprime
            localDraftId && (await deleteDraft(localDraftId));

            // Soumission du formulaire
            formData.handleSubmit();
        } catch (err) {
            setMessage(err);
        }
    };

    return (
        <div className="story-entry-wrapper">
            <Form onSubmit={handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <div className="d-flex flex-column rounded gap-1">
                        {/* Entête */}
                        <div className="d-flex align-items-center justify-content-between">
                            {/* Date */}
                            <span className="d-flex align-items-center gap-1 story-entry-header-date">
                                <GiBookmarklet size={32} className="p-1 story-entry-header-icon" />
                                {getLocalizedDate(story && inputOptions.action === EnumAction.UPDATE ? story.createdAt : new Date())}
                            </span>

                            {/* Boutons de contexte & symboles */}
                            <div className="d-flex flex-row align-items-center gap-1 story-entry-header-actions">
                                {/* Tags */}
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
                                        variant="filled-icon-action"
                                        className={`story-entry-header-button story-entry-header-button-${tag.code.toLowerCase()}`}
                                        onClick={() => insertTag(tag.code)}
                                        isSubmitting={isSubmitting}
                                    />
                                ))}

                                {/* Séparateur */}
                                <div className="rounded story-entry-header-separator"></div>

                                {/* Symboles */}
                                <div className="story-entry-header-symbols-container" ref={symbolsButtonRef}>
                                    <TooltipButton
                                        tooltip={t('campaign.symbols')}
                                        content={
                                            <div className="d-flex flew-row align-items-center rounded gap-1">
                                                <MdEmojiSymbols size={20} />
                                                <span className="story-entry-header-button-label">{t('campaign.symbols')}</span>
                                            </div>
                                        }
                                        variant="filled-icon-action"
                                        className="story-entry-header-button"
                                        onClick={handleShowSymbols}
                                        isSubmitting={isSubmitting}
                                    />

                                    {showSymbols && (
                                        <div className="d-flex flex-column rounded story-entry-header-symbols-panel" ref={symbolsPanelRef}>
                                            {symbols.map((group) => (
                                                <div key={group.id} className="p-1 story-entry-header-symbols-row">
                                                    {group.icons.map((symbol) => (
                                                        <Button
                                                            key={symbol}
                                                            className="p-0 rounded story-entry-symbol-button"
                                                            onClick={() => handleInsertSymbol(symbol)}
                                                        >
                                                            {symbol}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Saisie */}
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex gap-1">
                                {/* Navigation */}
                                <div className="story-entry-navigation-container">{renderNavigation}</div>

                                {/* Histoire */}
                                <div className="flex-grow-1">
                                    <TextareaInput
                                        name={'story'}
                                        ref={storyInputRef}
                                        placeholder={t('campaign.story')}
                                        value={formData.values.story}
                                        onChange={formData.handleChange}
                                    />
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="d-flex flex-row gap-2 justify-content-end">
                                <Button
                                    variant="outline-text-action"
                                    className="story-entry-cancel-button"
                                    onClick={onOpenClose}
                                    disabled={isSubmitting}
                                >
                                    {t('common.cancel')}
                                </Button>

                                <SpinnerButton
                                    variant="outline-text-action"
                                    className="story-entry-validate-button"
                                    label={t('common.validate')}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </Form>
        </div>
    );
};

export default StoryEntry;
