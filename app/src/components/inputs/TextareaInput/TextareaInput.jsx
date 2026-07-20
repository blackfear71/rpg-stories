import { Form } from 'react-bootstrap';

import './TextareaInput.css';

/**
 * Saisie zone de texte
 */
const TextareaInput = ({ title, icon, name, ref, placeholder, value, onChange, error, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="input-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            {/* Saisie */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control
                        ref={ref}
                        as="textarea"
                        name={name}
                        placeholder={placeholder}
                        className="textarea-input"
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
