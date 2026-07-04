import { Button, Spinner } from 'react-bootstrap';

/**
 * Bouton de validation avec spinner
 */
const SpinnerButton = ({ label, isSubmitting }) => {
    return (
        <Button type="submit" variant="modal-action" disabled={isSubmitting}>
            {label}
            {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
        </Button>
    );
};

export default SpinnerButton;
