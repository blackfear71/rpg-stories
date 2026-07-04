import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';

import { of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { FaSearch, FaTimes } from 'react-icons/fa';

import { TextInput } from '../../../components/inputs';
import { Message } from '../../../components/shared';

import { EditionsService } from '../../../api';

import './SearchBar.css';

// Valeurs initiales des formulaires
const initialSearchValues = {
    search: ''
};

/**
 * Barre de recherche
 */
const SearchBar = () => {
    // Router
    const navigate = useNavigate();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [resultMessage, setResultMessage] = useState(null);
    const [searchMessage, setSearchMessage] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // API states
    const [results, setResults] = useState([]);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Formik recherche
     */
    const formSearch = useFormik({
        initialValues: initialSearchValues,
        onSubmit: (values) => handleSubmitSearch(values)
    });

    /**
     * Lance la recherche à la saisie
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        formSearch.handleChange(e);
        formSearch.submitForm();
    };

    /**
     * Lance la recherche
     */
    const handleSubmitSearch = (values) => {
        setResultMessage(null);
        setSearchMessage(null);

        // On lance la recherche seulement à partir de 3 caractères saisis
        if (values.search.length === 0) {
            setResults([]);
            setShowResults(false);
        } else if (values.search.length > 2) {
            const editionsService = new EditionsService();

            editionsService
                .getSearchEditions({ search: values.search })
                .pipe(
                    map((dataEditions) => {
                        if (dataEditions.response.data.length === 0) {
                            setResultMessage('messages.noResults');
                        }

                        setResults(
                            dataEditions.response.data.map((item) => ({
                                ...item,
                                year: new Date(item.startDate).getFullYear()
                            }))
                        );
                        setShowResults(true);
                    }),
                    take(1),
                    catchError((err) => {
                        setSearchMessage({ code: err?.response?.message, type: err?.response?.status });
                        setShowResults(true);
                        return of();
                    })
                )
                .subscribe();
        } else {
            setResults([]);
            setResultMessage('messages.resultMessage');
            setShowResults(true);
            return;
        }
    };

    /**
     * Vide la zone de recherche
     */
    const handleClear = () => {
        // Vide les résultats
        setResults([]);
        setShowResults(false);
        setResultMessage(null);
        setSearchMessage(null);

        // Met le curseur sur la zone de saisie
        inputRef.current?.focus();

        // Réinitialise le formulaire
        formSearch.resetForm();
    };

    /**
     * Ferme la zone de recherche au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setShowResults(false);
        }
    };

    /**
     * Réaffiche la zone de recherche au clic sur la saisie
     */
    const handleFocus = () => {
        if (formSearch.values.search.length > 0) {
            setShowResults(true);
        }
    };

    /**
     * Redirige vers le résultat de la recherche
     * @param {*} id Identifiant de l'édition
     */
    const handleResultClick = (id) => {
        // Vide les résultats
        setResults([]);
        setShowResults(false);

        // Redirige vers l'édition
        navigate(`/edition/${id}`);
    };

    return (
        <div className="flex-fill" ref={containerRef}>
            {/* Barre de recherche */}
            <div className="search-bar-wrapper">
                <FaSearch className="d-flex align-items-center justify-content-center search-bar-icon search-icon" />

                <div className="search-bar-text">
                    <TextInput
                        name={'search'}
                        ref={inputRef}
                        placeholder={t('navbar.search')}
                        value={formSearch.values.search}
                        onFocus={handleFocus}
                        onChange={handleChange}
                    />
                </div>

                {formSearch.values.search && (
                    <FaTimes
                        className="d-flex align-items-center justify-content-center search-bar-icon clear-icon"
                        onClick={handleClear}
                    />
                )}
            </div>

            {/* Zone de résultats */}
            {showResults && (
                <>
                    {/* Messages */}
                    {resultMessage && (
                        <div className="search-results-dropdown">
                            <div className="p-2">{t(resultMessage)}</div>
                        </div>
                    )}

                    {searchMessage && (
                        <div className="search-results-dropdown">
                            <div className="p-2">
                                <Message
                                    code={searchMessage.code}
                                    params={searchMessage.params}
                                    type={searchMessage.type}
                                    setMessage={setSearchMessage}
                                />
                            </div>
                        </div>
                    )}

                    {/* Résultats */}
                    {results.length > 0 && (
                        <div className="search-results-dropdown">
                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    className="d-flex align-items-center justify-content-between p-2 search-result-item"
                                    onClick={() => handleResultClick(item.id)}
                                >
                                    <div className="search-result-item-left">{item.location}</div>
                                    <div className="ms-3 search-result-item-right">{t('edition.editionResult', { year: item.year })}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchBar;
