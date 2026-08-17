import { useTranslation } from 'react-i18next';

import { Story, StoryEntry } from '../../../components/features';

import { EnumAction } from '../../../enums';

import './StoryList.css';

/**
 * Liste des histoires
 */
const StoryList = ({
    stories,
    inputOptions,
    newStoryRef,
    campaignId,
    formData,
    draftsState,
    onConfirm,
    onOpenClose,
    onNavigate,
    registerRef,
    setMessage,
    isSubmitting
}) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {(inputOptions?.isOpen && inputOptions?.action === EnumAction.CREATE) || (stories && stories.length > 0) ? (
                <div className="d-flex flex-column gap-3 story-list-container">
                    {/* Timeline */}
                    <div className="rounded story-list-timeline"></div>

                    {/* Nouvelle histoire */}
                    {inputOptions?.isOpen && inputOptions?.action === EnumAction.CREATE && (
                        <div ref={newStoryRef} className="z-2 story-list-entry-wrapper">
                            <StoryEntry
                                campaignId={campaignId}
                                formData={formData}
                                draftsState={draftsState}
                                inputOptions={inputOptions}
                                onOpenClose={onOpenClose}
                                setMessage={setMessage}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Histoires */}
                    {stories?.map((story, index) => (
                        <Story
                            key={story.id}
                            story={story}
                            storyCount={stories.length}
                            isFirstStory={index === 0}
                            isLastStory={index === stories.length - 1}
                            formData={formData}
                            draftsState={draftsState}
                            inputOptions={inputOptions}
                            onConfirm={onConfirm}
                            onOpenClose={onOpenClose}
                            onNavigate={(direction) => onNavigate(direction, index)}
                            registerRef={registerRef}
                            setMessage={setMessage}
                            isSubmitting={isSubmitting}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-5 rounded story-list-empty">{t('campaign.emptyStories')}</div>
            )}
        </>
    );
};

export default StoryList;
