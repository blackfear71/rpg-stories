import { useTranslation } from 'react-i18next';

import { Form } from 'react-bootstrap';

/**
 * Saisie date
 */
const DateInput = ({ title, icon, name, value, onChange, error, required = false }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="input-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="d-flex flex-column w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control type="date" name={name} value={value || ''} onChange={onChange} isInvalid={!!error} />

                    {error && <Form.Control.Feedback type="invalid">{t(error)}</Form.Control.Feedback>}
                </Form.Group>
            </div>
        </div>
    );
};

export default DateInput;
