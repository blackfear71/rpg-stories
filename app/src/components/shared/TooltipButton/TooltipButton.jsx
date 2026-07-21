import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * Bouton d'action avec tooltip
 */
const TooltipButton = ({ tooltip, content, className = null, onClick, isSubmitting }) => {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button variant="outline-action" className={className} onClick={onClick} disabled={isSubmitting}>
                {content}
            </Button>
        </OverlayTrigger>
    );
};

export default TooltipButton;
