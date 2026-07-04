import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import './PasswordInput.css';

/**
 * Saisie mot de passe
 */
const PasswordInput = ({ title, icon, name, ref, placeholder, value, onChange, error, maxLength, required = false }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Affiche ou masque le mot de passe
     */
    const toggleVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="modal-group-content-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <InputGroup hasValidation>
                        <Form.Control
                            ref={ref}
                            type={showPassword ? 'text' : 'password'}
                            name={name}
                            placeholder={placeholder}
                            className="password-input"
                            value={value}
                            onChange={onChange}
                            maxLength={maxLength}
                            isInvalid={!!error}
                        />

                        <Button
                            onClick={() => toggleVisibility()}
                            tabIndex={-1}
                            className="d-flex align-items-center password-input-button"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>

                        {error && <Form.Control.Feedback type="invalid">{t(error)}</Form.Control.Feedback>}
                    </InputGroup>
                </Form.Group>
            </div>
        </div>
    );
};

export default PasswordInput;
