import { useTranslation } from 'react-i18next';

import { Button, Form } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa6';

import './IncrementInput.css';

/**
 * Saisie incrément
 */
const IncrementInput = ({ title, icon, name, value, onChangeDown, onChangeUp, error }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && <div className="modal-group-content-title">{title}</div>}

            {/* Saisie */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <div className="d-flex align-items-center gap-2">
                        <Button className="d-flex align-items-center justify-content-center increment-input-button" onClick={onChangeDown}>
                            <FaMinus />
                        </Button>

                        <div
                            className={`d-flex align-items-center justify-content-center increment-input-value ${value > 0 ? 'green' : value < 0 ? 'red' : ''} ${error ? 'is-invalid' : ''}`}
                        >
                            {value || 0}
                        </div>

                        <Button className="d-flex align-items-center justify-content-center increment-input-button" onClick={onChangeUp}>
                            <FaPlus />
                        </Button>
                    </div>

                    {error && <div className="invalid-feedback d-block">{t(error)}</div>}
                </Form.Group>
            </div>
        </div>
    );
};

export default IncrementInput;
