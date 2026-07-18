import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Form, Image } from 'react-bootstrap';
import { FaTrashCan } from 'react-icons/fa6';

import { EnumAction } from '../../../enums';

import './PictureInput.css';

/**
 * Saisie image avec aperçu et suppression
 */
const PictureInput = ({ title, icon, name, value, onChange, error, isSubmitting, required = false }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [fileName, setFileName] = useState('');
    const [pictureError, setPictureError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Constantes
    const fileInputRef = useRef(null);

    /**
     * Initialise l'image existante si "value" est fourni
     */
    useEffect(() => {
        setPictureError(null);
        let objectUrl = null;

        if (value) {
            // Si c'est le nom d'un fichier existant sur le serveur
            if (typeof value === 'string') {
                setPreviewUrl(`${import.meta.env.VITE_API_URL}/serve-file/images?file=${encodeURIComponent(value)}`);
                setFileName(value);
            }
            // Si c'est un fichier saisi (File object)
            else if (value instanceof File) {
                objectUrl = URL.createObjectURL(value);
                setPreviewUrl(objectUrl);
                setFileName(value.name);
            }
        } else {
            setPreviewUrl(null);
            setFileName('');
        }

        // Cleanup : révoque l'URL blob au prochain changement ou au démontage
        return () => {
            objectUrl && URL.revokeObjectURL(objectUrl);
        };
    }, [value]);

    /**
     * Gère le changement d'image
     * @param {*} e Evènement
     */
    const handleFileChange = (e) => {
        setPictureError(null);
        const file = e.target.files[0];

        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            // Si le type de fichier est autorisé, on met à jour le formulaire
            if (allowedTypes.includes(file.type)) {
                previewUrl && URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(file));
                setFileName(file.name);

                onChange?.(file, EnumAction.CREATE);
            } else {
                e.target.value = '';
                setPreviewUrl(null);
                setFileName('');

                setPictureError('errors.invalidFileType');
            }
        }
    };

    /**
     * Gère la suppression d'image
     */
    const handleFileRemove = () => {
        setFileName('');
        setPreviewUrl(null);

        // Force le champ à vider le fichier en mémoire
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        onChange?.(null, EnumAction.DELETE);
    };

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

                {/* Parcourir */}
                <Form.Group controlId={isSubmitting ? undefined : name}>
                    <Form.Label
                        className="d-flex align-items-center justify-content-center picture-input-button rounded p-3 m-0"
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.65 : 1 }}
                    >
                        {t('common.browse')}
                    </Form.Label>

                    <Form.Control
                        ref={fileInputRef}
                        className="visually-hidden"
                        type="file"
                        name={name}
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        isInvalid={!!pictureError || !!error}
                    />

                    {(pictureError || error) && <Form.Control.Feedback type="invalid">{t(pictureError || error)}</Form.Control.Feedback>}
                </Form.Group>

                {/* Aperçu et suppression */}
                <div className="w-100 picture-input-preview-wrapper">
                    {previewUrl ? (
                        <div className="d-flex align-items-center gap-2 w-100 picture-input-preview-content">
                            {/* Aperçu */}
                            <Image key={previewUrl} src={previewUrl} alt={fileName} rounded className="picture-input-preview-image" />

                            {/* Suppression */}
                            <Button
                                onClick={handleFileRemove}
                                className="d-flex align-items-center justify-content-center input-button-delete"
                            >
                                <FaTrashCan />
                            </Button>
                        </div>
                    ) : (
                        t('common.noFilesSelected')
                    )}
                </div>
            </div>
        </div>
    );
};

export default PictureInput;
