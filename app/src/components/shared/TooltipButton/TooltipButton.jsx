import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * Bouton d'action avec tooltip
 */
const TooltipButton = ({ tooltip, icon, onClick, isSubmitting }) => {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button variant="outline-action" onClick={onClick} disabled={isSubmitting}>
                {icon}
            </Button>
        </OverlayTrigger>
    );
};

export default TooltipButton;
