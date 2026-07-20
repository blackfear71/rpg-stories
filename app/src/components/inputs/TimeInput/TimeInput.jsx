import { useTranslation } from 'react-i18next';

import { Form } from 'react-bootstrap';

import './TimeInput.css';

/**
 * Saisie heure de début et de fin
 */
const TimeInput = ({
    title,
    icon,
    nameStart,
    nameEnd,
    titleStart,
    titleEnd,
    valueStart,
    valueEnd,
    onChange,
    errorStart,
    errorEnd,
    required = false
}) => {
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

            {/* Saisies */}
            <div className="d-flex align-items-center gap-2 time-input-wrapper">
                {/* Icône */}
                {icon && <div className="input-icon">{icon}</div>}

                <div className="d-flex align-items-start gap-2 time-input-fields">
                    {/* Début */}
                    <Form.Group className="time-input-field" controlId={nameStart}>
                        <div className="d-flex align-items-center time-input-group">
                            <span className="px-2 time-input-prefix">{titleStart}</span>

                            <Form.Label className="visually-hidden">{titleStart ?? nameStart}</Form.Label>

                            <Form.Control
                                className="w-100 px-2 time-input-control"
                                type="time"
                                name={nameStart}
                                value={valueStart || ''}
                                onChange={onChange}
                                isInvalid={!!errorStart}
                            />
                        </div>

                        {errorStart && (
                            <Form.Control.Feedback className="d-block" type="invalid">
                                {t(errorStart)}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    {/* Fin */}
                    <Form.Group className="time-input-field" controlId={nameEnd}>
                        <div className="d-flex align-items-center time-input-group">
                            <span className="px-2 time-input-prefix">{titleEnd}</span>

                            <Form.Label className="visually-hidden">{titleEnd ?? nameEnd}</Form.Label>

                            <Form.Control
                                className="w-100 px-2 time-input-control"
                                type="time"
                                name={nameEnd}
                                value={valueEnd || ''}
                                onChange={onChange}
                                isInvalid={!!errorEnd}
                            />
                        </div>

                        {errorEnd && (
                            <Form.Control.Feedback className="d-block" type="invalid">
                                {t(errorEnd)}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </div>
            </div>
        </div>
    );
};

export default TimeInput;
