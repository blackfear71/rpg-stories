import { Badge, ProgressBar } from 'react-bootstrap';

import './ProgressCard.css';

/**
 * Carte avec barre de progression
 */
const ProgressCard = ({ title, icon, value, badgeStart, badgeEnd, detail }) => {
    return (
        <div className="progress-card mt-3">
            {/* Entête de la carte */}
            <div className="d-flex align-items-center justify-content-between p-2 progress-card-header">
                <div className="d-flex align-items-center gap-2 progress-card-title">
                    {icon}
                    {title}
                </div>

                {value && <span>{Math.round(value)}%</span>}
            </div>

            {/* Barre de progression de la carte */}
            <div className="d-flex flex-column gap-2 p-2">
                <div className="d-flex align-items-center mt-1">
                    {badgeStart && (
                        <Badge pill bg="success" className="me-2">
                            {badgeStart}
                        </Badge>
                    )}

                    <div className="flex-fill">
                        <ProgressBar now={value} className="rounded-pill" />
                    </div>

                    {badgeEnd && (
                        <Badge pill bg="danger" className="ms-2">
                            {badgeEnd}
                        </Badge>
                    )}
                </div>

                {detail && <div className="progress-card-detail">{detail}</div>}
            </div>
        </div>
    );
};

export default ProgressCard;
