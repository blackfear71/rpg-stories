import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * Bouton d'action avec tooltip
 */
const TooltipButton = ({ tooltip, content, variant = null, className = null, onClick, isSubmitting }) => {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button variant={variant} className={className} onClick={onClick} disabled={isSubmitting}>
                {content}
            </Button>
        </OverlayTrigger>
    );
};

export default TooltipButton;
