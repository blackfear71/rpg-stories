import { Form } from 'react-bootstrap';

/**
 * Saisie zone de texte
 */
const TextareaInput = ({ title, icon, name, placeholder, value, onChange, error, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="modal-group-content-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            {/* Saisie */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control
                        as="textarea"
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        isInvalid={!!error}
                    />

                    {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
                </Form.Group>
            </div>
        </div>
    );
};

export default TextareaInput;
