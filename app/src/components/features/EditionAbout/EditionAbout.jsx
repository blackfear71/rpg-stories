import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from 'react-bootstrap';
import { CgSandClock } from 'react-icons/cg';
import { FaFlagCheckered, FaScroll, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';

import rpgStoriesLogo from '../../../assets/images/rpg-stories.webp';

import { ProgressCard, TableCard, TextCard } from '../../../components/ui';

import { getLocalizedDate, getLocalizedDuration, getLocalizedTime } from '../../../utils/helpers/dateHelper';

import { EnumAction } from '../../../enums';

/**
 * A propos
 */
const EditionAbout = ({ rights, edition, onOpen, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [progress, setProgress] = useState({ value: 0, remaining: 0, isActive: false });

    /**
     * Mise à jour de l'avancement
     */
    useEffect(() => {
        // Mise à jour initiale de l'avancement
        updateProgress();

        // Mise à jour toutes les 60 secondes
        const interval = setInterval(updateProgress, 60 * 1000);

        // Nettoyage à la destruction
        return () => clearInterval(interval);
    }, [edition?.startDate, edition?.endDate]);

    /**
     * Met à jour l'avancement
     */
    const updateProgress = () => {
        if (!edition || !edition.startDate || !edition.endDate) {
            return;
        }

        const now = new Date();
        const startDate = new Date(edition.startDate);
        const endDate = new Date(edition.endDate);

        let value = 0;
        let remaining = 0;
        const isActive = now >= startDate && now <= endDate;

        if (isActive) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();

            value = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            remaining = endDate - now;
        }

        setProgress({
            value: value,
            remaining: remaining,
            isActive: isActive
        });
    };

    /**
     * Prépare les lignes d'informations
     * @returns Liste de lignes
     */
    const getInformationsRows = () => [
        {
            label: t('edition.location'),
            value: edition.location
        },
        {
            label: t('edition.start'),
            value: t('edition.editionDate', {
                date: getLocalizedDate(edition.startDate),
                time: getLocalizedTime(edition.startDate)
            })
        },
        {
            label: t('edition.end'),
            value: t('edition.editionDate', {
                date: getLocalizedDate(edition.endDate),
                time: getLocalizedTime(edition.endDate)
            })
        }
    ];

    return (
        <>
            {/* Actions */}
            {rights.isSuperAdmin && (
                <div className="d-flex gap-2 mb-2">
                    {/* Modifier */}
                    <Button variant="outline-action" onClick={() => onOpen(EnumAction.UPDATE)} disabled={isSubmitting}>
                        <FaWandMagicSparkles size={15} />
                        {t('common.update')}
                    </Button>

                    {/* Supprimer */}
                    <Button variant="outline-action" className="btn-red" onClick={onConfirm} disabled={isSubmitting}>
                        <FaTrashCan size={15} />
                        {t('common.delete')}
                    </Button>
                </div>
            )}

            {edition && (
                <>
                    {/* Progression */}
                    {progress && progress.isActive && (
                        <ProgressCard
                            icon={<CgSandClock size={20} />}
                            title={t('edition.progress')}
                            value={progress.value}
                            badgeStart={getLocalizedTime(edition.startDate)}
                            badgeEnd={getLocalizedTime(edition.endDate)}
                            detail={t('edition.progressStatus', { remaining: getLocalizedDuration(progress.remaining) })}
                        />
                    )}

                    {/* Informations */}
                    <TableCard
                        icon={<IoInformationCircleOutline size={22} />}
                        title={t('edition.informations')}
                        table={getInformationsRows()}
                    />

                    {/* Thème */}
                    {edition.theme && <TextCard icon={<FaScroll size={18} />} title={t('edition.theme')} text={edition.theme} />}

                    {/* Défi */}
                    {edition.challenge && (
                        <TextCard icon={<FaFlagCheckered size={18} />} title={t('edition.challenge')} text={edition.challenge} />
                    )}

                    {/* QR Code */}
                    <div className="d-flex justify-content-center mt-3">
                        <QRCodeSVG
                            className="p-2 bg-white rounded"
                            value={`${import.meta.env.VITE_APP_URL}/edition/${edition.id}`}
                            size={150}
                            level="Q"
                            fgColor="#07224c"
                            imageSettings={{
                                src: rpgStoriesLogo,
                                width: 40,
                                height: 40,
                                excavate: true
                            }}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default EditionAbout;
