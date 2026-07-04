import { useTranslation } from 'react-i18next';

import { Form } from 'react-bootstrap';

/**
 * Saisie ligne de texte
 */
const TextInput = ({
    title,
    icon,
    name,
    ref,
    type = 'text',
    placeholder,
    value,
    onFocus,
    onChange,
    error,
    maxLength,
    inputMode,
    pattern,
    required = false
}) => {
    // Traductions
    const { t } = useTranslation();

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
                <Form.Group className="d-flex flex-column w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control
                        ref={ref}
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onFocus={onFocus}
                        onChange={onChange}
                        maxLength={maxLength}
                        inputMode={inputMode}
                        pattern={pattern}
                        isInvalid={!!error}
                    />

                    {error && <Form.Control.Feedback type="invalid">{t(error)}</Form.Control.Feedback>}
                </Form.Group>
            </div>
        </div>
    );
};

export default TextInput;
