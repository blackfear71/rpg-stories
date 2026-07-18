import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form } from 'react-bootstrap';

import { TextareaInput } from '../../../components/inputs';

import { getLocalizedDate } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

import './Story.css';

import { SpinnerButton } from '../../shared';

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
        // Focus à la création
        inputOptions?.isOpen && storyInputRef.current?.focus();
    }, [inputOptions?.isOpen]);

    return (
        <>
            {inputOptions.isOpen && inputOptions.action === EnumAction.UPDATE && story.id === inputOptions.storyId ? (
                <>
                    {/* TODO : trads */}
                    {/* Mode saisie */}
                    <Form onSubmit={formData.handleSubmit}>
                        <fieldset disabled={isSubmitting}>
                            <div className="d-flex flex-column ps-2 pe-2 todo-supprimer mb-2 bg-white">
                                {/* Date & boutons de contexte */}
                                <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                                    <span className="table-card-line-label">{getLocalizedDate(story.createdAt)}</span>
                                    <span className="table-card-line-value">
                                        <Button disabled={isSubmitting}>EXPLORATION</Button>
                                        <Button disabled={isSubmitting}>COMBAT</Button>
                                    </span>
                                </div>

                                {/* Histoire */}
                                <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                                    <span className="table-card-line-label">
                                        <TextareaInput
                                            name={'story'}
                                            ref={storyInputRef}
                                            placeholder={t('campaign.story')}
                                            value={formData.values.story}
                                            onChange={formData.handleChange}
                                        />
                                    </span>
                                </div>

                                {/* Annuler & Valider */}
                                <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                                    <span className="table-card-line-value">
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
            ) : (
                <>
                    {/* Mode affichage */}
                    <div className="d-flex flex-column ps-2 pe-2 todo-supprimer mb-2 bg-white">
                        {/* Date & boutons d'actions */}
                        <div className="d-flex align-items-center justify-content-between pt-2 pb-2 table-card-line">
                            <span className="table-card-line-label">{getLocalizedDate(story.createdAt)}</span>
                            <span className="table-card-line-value">
                                <Button onClick={() => onConfirm(story.createdAt)} disabled={isSubmitting}>
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
                </>
            )}
        </>
    );
};

export default Story;
