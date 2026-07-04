import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';
import { IoSettingsOutline } from 'react-icons/io5';

import { SettingsUser, SettingsUsers } from '../../components/features';
import { ConfirmModal, PasswordModal, SettingsModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../enums';

import { UsersService } from '../../api';

import './Settings.css';

// Valeurs initiales des formulaires
const initialPasswordValues = {
    password: '',
    oldPassword: '',
    confirmPassword: ''
};
const initialUserValues = {
    id: null,
    login: '',
    password: '',
    confirmPassword: '',
    level: ''
};

/**
 * Paramètres
 */
const Settings = () => {
    // Router
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage, refreshAuth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: null,
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsPassword, setModalOptionsPassword] = useState({
        isOpen: false,
        message: null
    });
    const [modalOptionsUser, setModalOptionsUser] = useState({
        action: null,
        userId: null,
        isOpen: false,
        message: null
    });

    // API states
    const [users, setUsers] = useState([]);
    const [connectedUser, setConnectedUser] = useState(null);

    // Constantes
    const rights = {
        isUser: auth.isLoggedIn && auth.level === EnumUserRole.USER,
        isAdmin: auth.isLoggedIn && auth.level === EnumUserRole.ADMIN,
        isSuperAdmin: auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN
    };

    /**
     * Schéma de validation Yup du mot de passe
     */
    const passwordValidationSchema = useMemo(() => {
        return Yup.object({
            oldPassword: Yup.string().required('errors.invalidPassword'),
            password: Yup.string()
                .required('errors.invalidPassword')
                .notOneOf([Yup.ref('oldPassword')], 'errors.passwordIdentical'),
            confirmPassword: Yup.string()
                .required('errors.invalidPassword')
                .oneOf([Yup.ref('password')], 'errors.passwordMatch')
        });
    }, []);

    /**
     * Schéma de validation Yup de l'utilisateur
     */
    const userValidationSchema = useMemo(() => {
        return Yup.object({
            ...(modalOptionsUser.action === EnumAction.CREATE && {
                login: Yup.string().required('errors.invalidLogin'),
                password: Yup.string().required('errors.invalidPassword'),
                confirmPassword: Yup.string()
                    .required('errors.invalidPassword')
                    .oneOf([Yup.ref('password')], 'errors.passwordMatch')
            }),
            level: Yup.number()
                .typeError('errors.invalidLevel')
                .required('errors.invalidLevel')
                .min(0, 'errors.invalidLevel')
                .max(2, 'errors.invalidLevel')
        });
    }, [modalOptionsUser.action]);

    /**
     * Formik mot de passe
     */
    const formPassword = useFormik({
        initialValues: initialPasswordValues,
        validationSchema: passwordValidationSchema,
        onSubmit: (values) => handleSubmitPassword(values)
    });

    /**
     * Formik utilisateur
     */
    const formUser = useFormik({
        initialValues: initialUserValues,
        validationSchema: userValidationSchema,
        onSubmit: (values) => handleSubmitUser(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification si l'utilisateur s'est déconnecté ailleurs
        refreshAuth(false);
    }, []);

    /**
     * Récupération des données après contrôle de l'authentification
     */
    useEffect(() => {
        // Retour à l'accueil si non connecté (on ne fait la navigation que si on n'est pas déjà revenu à l'accueil, après déconnexion par exemple)
        if (!auth.isLoggedIn) {
            if (pathname === '/settings') {
                navigate('/');
            }
            return;
        }

        // Récupération des données utilisateurs
        if (rights.isSuperAdmin) {
            const usersService = new UsersService();

            usersService
                .getAllUsers()
                .pipe(
                    map((dataUsers) => {
                        const processedUsers = processUsersData(dataUsers.response.data);

                        setUsers(processedUsers);
                        setConnectedUser(processedUsers.find((u) => u.id === auth.id));
                    }),
                    take(1),
                    catchError((err) => {
                        setMessage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setIsLoading(false);
                    })
                )
                .subscribe();
        } else {
            setConnectedUser({
                id: auth.id,
                login: auth.login,
                level: auth.level,
                role: getUserRole(auth.level)
            });
            setIsLoading(false);
        }
    }, [auth]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage && authMessage.target === 'page') {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Mise à jour du formulaire de l'édition aux changements de sa modale
     */
    useEffect(() => {
        // Réinitialisation à l'ouverture/fermeture de la modale
        formPassword.resetForm();
    }, [modalOptionsPassword.isOpen]);

    /**
     * Mise à jour du formulaire de l'utilisateur aux changements de sa modale
     */
    useEffect(() => {
        // Initialisation à l'ouverture de la modale
        if (modalOptionsUser.isOpen && modalOptionsUser.userId) {
            if (modalOptionsUser.action === EnumAction.UPDATE) {
                const currentUser = users.find((u) => u.id === modalOptionsUser.userId);

                formUser.setValues({
                    id: currentUser.id,
                    login: currentUser.login,
                    password: '',
                    confirmPassword: '',
                    level: currentUser.level
                });
            } else {
                formUser.resetForm();
            }
        }

        // Réinitialisation à la fermeture de la modale
        if (!modalOptionsUser.isOpen) {
            formUser.resetForm();
        }
    }, [modalOptionsUser.isOpen, modalOptionsUser.userId]);

    /**
     * Enrichit les données utilisateurs avec les informations de rôle
     * @param {*} usersData Données utilisateurs
     * @returns Données utilisateurs enrichies
     */
    const processUsersData = (usersData) => {
        return usersData.map((user) => ({
            ...user,
            role: getUserRole(user.level)
        }));
    };

    /**
     * Récupère les données du rôle de l'utilisateur
     * @param {*} level Niveau utilisateur
     * @returns Données du rôle
     */
    const getUserRole = (level) => {
        switch (level) {
            case EnumUserRole.USER:
                return { label: t(`settings.level${level}`), icon: <FaUser size={18} /> };
            case EnumUserRole.ADMIN:
                return { label: t(`settings.level${level}`), icon: <FaUserPlus size={18} /> };
            case EnumUserRole.SUPERADMIN:
                return { label: t(`settings.level${level}`), icon: <FaStar size={18} /> };
            default:
                return { label: t('settings.unknownLevel'), icon: <FaQuestionCircle size={18} /> };
        }
    };

    /**
     * Ouverture/fermeture de la modale de modification mot de passe
     */
    const openClosePasswordModal = () => {
        // Ouverture ou fermeture
        setModalOptionsPassword((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Modification du mot de passe
     * @param {*} values Données du formulaire
     */
    const handleSubmitPassword = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsPassword((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .updatePassword(values)
            .pipe(
                map((dataUsers) => {
                    openClosePasswordModal();
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsPassword((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de création/modification d'utilisateur
     * @param {*} action Action à réaliser
     * @param {*} userId Identifiant utilisateur
     */
    const openCloseUserModal = (action = null, userId = null) => {
        // Ouverture ou fermeture
        setModalOptionsUser((prev) => ({
            ...prev,
            action: action,
            userId: userId,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Création/modification d'un utilisateur
     * @param {*} values Données du formulaire
     */
    const handleSubmitUser = (values) => {
        setMessage(null);
        setModalOptionsUser((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        let subscriptionUsers = null;

        switch (modalOptionsUser?.action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);

                subscriptionUsers = usersService.createUser({
                    login: values.login,
                    password: values.password,
                    confirmPassword: values.confirmPassword,
                    level: values.level
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);

                subscriptionUsers = usersService.updateUser(values.id, {
                    level: values.level
                });
                break;
        }

        subscriptionUsers
            ?.pipe(
                map((dataUser) => {
                    setMessage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    openCloseUserModal();
                    setUsers(processUsersData(dataUsers.response.data));

                    // Rafraichissement du contexte d'authentification si l'utilisateur modifié est l'utilisateur courant
                    if (auth.id === dataUsers.response.data.find((u) => u.id === values.id)?.id) {
                        refreshAuth(false);
                    }
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation du mot de passe
     * @param {*} userId Identifiant utilisateur
     */
    const handleResetPassword = (userId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsUser((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .resetPassword(userId)
            .pipe(
                map((dataUsers) => {
                    setModalOptionsUser((prev) => ({
                        ...prev,
                        message: {
                            code: dataUsers.response.message,
                            params: { password: dataUsers.response.data },
                            type: dataUsers.response.status
                        }
                    }));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de confirmation
     * @param {*} confirmOptions Données modale de confirmation
     */
    const openCloseConfirmModal = (confirmOptions) => {
        // Ouverture ou fermeture
        if (confirmOptions) {
            setModalOptionsConfirm({
                content: confirmOptions.content,
                action: confirmOptions.action,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: null,
                data: null,
                isOpen: false,
                message: null
            });
        }
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm?.action) {
            case 'deleteUser':
                return handleDeleteUser(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression d'un utilisateur
     * @param {*} userId Identifiant utilisateur
     */
    const handleDeleteUser = (userId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .deleteUser(userId)
            .pipe(
                map((dataUser) => {
                    setMessage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    openCloseConfirmModal();
                    setUsers(processUsersData(dataUsers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({ ...prev, message: { code: err?.response?.message, type: err?.response?.status } }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Paramètres */}
                    {auth.isLoggedIn && (
                        <>
                            {/* Titre */}
                            <h1 className="d-flex align-items-center gap-2">
                                <IoSettingsOutline size={30} />
                                {t('settings.settingsTitle')}
                            </h1>

                            {rights.isSuperAdmin && connectedUser && users ? (
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="user"
                                    id="justify-tab-example"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Utilisateur connecté */}
                                    <Tab eventKey="user" title={t('settings.level0')}>
                                        <SettingsUser user={connectedUser} onOpen={openClosePasswordModal} isSubmitting={isSubmitting} />
                                    </Tab>

                                    {/* Gestion utilisateurs */}
                                    <Tab eventKey="users" title={t('settings.manageUsers')}>
                                        <SettingsUsers
                                            users={users}
                                            onOpen={openCloseUserModal}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>
                            ) : (
                                <>
                                    {/* Utilisateur connecté */}
                                    {connectedUser && (
                                        <SettingsUser user={connectedUser} onOpen={openClosePasswordModal} isSubmitting={isSubmitting} />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Modale de modification de mot de passe */}
                    {auth.isLoggedIn && formPassword && modalOptionsPassword.isOpen && (
                        <PasswordModal
                            user={connectedUser}
                            formData={formPassword}
                            modalOptions={modalOptionsPassword}
                            setModalOptions={setModalOptionsPassword}
                            onClose={openClosePasswordModal}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de modification d'utilisateur */}
                    {rights.isSuperAdmin && formUser && modalOptionsUser.isOpen && (
                        <SettingsModal
                            user={users.find((u) => u.id === modalOptionsUser.userId)}
                            formData={formUser}
                            modalOptions={modalOptionsUser}
                            setModalOptions={setModalOptionsUser}
                            onReset={handleResetPassword}
                            onClose={openCloseUserModal}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de confirmation */}
                    {rights.isSuperAdmin && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            setModalOptions={setModalOptionsConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleConfirmAction}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default Settings;
