import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button } from 'react-bootstrap';
import { FaAngleRight, FaGift, FaSort, FaTrashCan } from 'react-icons/fa6';
import { GiCardboardBox, GiCardboardBoxClosed } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';

import { EnumAction } from '../../../../enums';

/**
 * Liste des cadeaux
 */
const GiftList = ({ rights, gifts, title, onOpen, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [sortMode, setSortMode] = useState('name');

    /**
     * Change le mode de tri (nom > valeur > quantité)
     */
    const handleToggleSort = () => {
        setSortMode((prev) => {
            if (prev === 'name') {
                return 'value';
            }

            if (prev === 'value') {
                // Vérifie si toutes les quantités sont à 0
                const allZero = gifts.every((g) => g.remainingQuantity === 0);

                // Si toutes les quantités sont à 0, on passe au nom directement
                return allZero ? 'name' : 'quantity';
            }

            // Si on était sur quantity, on revient toujours à name
            return 'name';
        });
    };

    /**
     * Cadeaux triés
     */
    const sortedGifts = useMemo(() => {
        switch (sortMode) {
            // Tri par valeur
            case 'value':
                return gifts?.sort((a, b) => (b.value !== a.value ? b.value - a.value : a.name.localeCompare(b.name)));

            // Tri par quantité
            case 'quantity':
                return gifts?.sort((a, b) =>
                    b.remainingQuantity !== a.remainingQuantity ? b.remainingQuantity - a.remainingQuantity : a.name.localeCompare(b.name)
                );

            // Tri par nom (par défaut)
            case 'name':
            default:
                return gifts?.sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [gifts, sortMode]);

    /**
     * Ouvre la modale de suppression de cadeau
     * @param {*} gift Cadeau
     */
    const handleDelete = (gift) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deleteGift', { name: gift.name }),
            action: 'deleteGift',
            data: gift.id
        });
    };

    return (
        <>
            {/* Titre & tri */}
            <div className="d-flex align-items-center justify-content-between gap-2">
                <Badge pill bg="warning" className="edition-subtitle-badge">
                    {title}
                </Badge>

                <Button className="d-flex align-items-center p-2 gap-2 edition-gifts-sort" onClick={handleToggleSort}>
                    <FaSort size={15} />
                    {sortMode === 'name' && <FaGift size={15} />}
                    {sortMode === 'value' && <GrMoney size={15} />}
                    {sortMode === 'quantity' && <GiCardboardBox size={15} />}
                </Button>
            </div>

            {/* Liste */}
            {sortedGifts?.map((g) => (
                <div key={g.id} className="d-flex align-items-center gap-2 p-2 mt-2 edition-item">
                    {/* Icône */}
                    <div
                        className="d-flex align-items-center justify-content-center edition-item-icon"
                        style={{ backgroundColor: g.color }}
                    >
                        {g.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Cadeau */}
                    <div className="d-flex flex-column flex-grow-1 edition-item-name">
                        <span className={`edition-item-ellipsis-text ${g.remainingQuantity === 0 ? 'text-decoration-line-through' : ''}`}>
                            {g.name}
                        </span>

                        <div className="d-flex align-items-center gap-2">
                            <span className="d-flex align-items-center gap-1 edition-item-counter">
                                <GrMoney size={15} />
                                {g.value}
                            </span>

                            <span className="d-flex align-items-center gap-1 edition-item-counter">
                                {g.remainingQuantity === 0 ? <GiCardboardBoxClosed size={18} /> : <GiCardboardBox size={18} />}
                                {`${g.remainingQuantity}/${g.quantity}`}
                            </span>
                        </div>
                    </div>

                    {/* Supression */}
                    {rights.isSuperAdmin && (
                        <Button
                            onClick={() => handleDelete(g)}
                            className="edition-item-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            disabled={isSubmitting}
                        >
                            <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}

                    {/* Modification */}
                    {rights.isAdminOrSuperAdminOnEdition && (
                        <Button
                            onClick={() => onOpen(EnumAction.UPDATE, g.id)}
                            className="edition-item-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            disabled={isSubmitting}
                        >
                            <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}
                </div>
            ))}
        </>
    );
};

export default GiftList;
