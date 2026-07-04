import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { FaArrowRightLong, FaArrowUpLong } from 'react-icons/fa6';

import './TextCard.css';

/**
 * Carte texte repliable
 */
const TextCard = ({ icon, title, text, limit = 200 }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [textContent, setTextContent] = useState({ expanded: false, isLong: false, text: '' });

    /**
     * Mise à jour du texte (avec troncature si trop long)
     */
    useEffect(() => {
        const isLong = text?.length > limit;

        setTextContent({
            expanded: false,
            isLong,
            text: isLong ? text.slice(0, limit) + '...' : (text ?? '')
        });
    }, [text, limit]);

    /**
     * Plie ou déplie le texte
     */
    const toggle = () => {
        setTextContent((prev) => ({
            ...prev,
            expanded: !prev.expanded,
            text: !prev.expanded ? text : text.slice(0, limit) + '...'
        }));
    };

    return (
        <div className="text-card mt-3">
            {/* Entête de la carte */}
            <div className="d-flex align-items-center gap-2 p-2 text-card-header">
                {icon}
                {title}
            </div>

            {/* Texte de la carte */}
            <div className="d-flex flex-column p-2">
                <div className="text-card-content">{textContent.text}</div>

                {textContent.isLong && (
                    <Button className="d-flex align-items-center p-0 mt-2 gap-1 text-card-content-toggle" onClick={toggle}>
                        {textContent.expanded ? (
                            <>
                                {t('common.readLess')}
                                <FaArrowUpLong size={10} />
                            </>
                        ) : (
                            <>
                                {t('common.readMore')}
                                <FaArrowRightLong size={10} />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default TextCard;
