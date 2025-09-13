// client/src/pages/Admin/ManageUsersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchUsersApi, createStaffUserApi, updateUserByIdApi, deleteUserApi } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Spinner from '../../components/UI/Spinner';
import { KeyRound, PlusCircle, Edit, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ManageUsersPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // User being edited/created

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [isActive, setIsActive] = useState(true);
    const [modalError, setModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await fetchUsersApi();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || t('manageUsers.messages.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentUser(null);
        setUsername('');
        setPassword('');
        setRole('staff');
        setIsActive(true);
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setCurrentUser(user);
        setUsername(user.username);
        setPassword(''); // Don't show existing password
        setRole(user.role);
        setIsActive(user.isActive);
        setModalError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleDelete = async (userId, username) => {
        if (window.confirm(t('manageUsers.actions.deleteConfirm', { username }))) {
            try {
                await deleteUserApi(userId);
                setSuccess(t('manageUsers.messages.deleteSuccess', { username }));
                loadUsers(); // Refresh list
            } catch (err) {
                setError(err.response?.data?.message || t('manageUsers.messages.deleteFailed'));
            } finally {
                setTimeout(() => setSuccess(''), 4000);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setIsSubmitting(true);
        
        const payload = { username, role, isActive };
        if (!isEditing && password) payload.password = password; // Only send password on create
        if (isEditing && password) {
             alert(t('manageUsers.actions.passwordChangeAlert'));
             // For now, we won't handle password changes here. A separate form would be better.
        }

        try {
            if (isEditing) {
                await updateUserByIdApi(currentUser._id, payload);
                setSuccess(t('manageUsers.messages.updateSuccess', { username }));
            } else {
                await createStaffUserApi(payload);
                setSuccess(t('manageUsers.messages.createSuccess', { username }));
            }
            closeModal();
            loadUsers(); // Refresh the list
        } catch (err) {
            const errorMessage = isEditing 
                ? t('manageUsers.messages.updateFailed')
                : t('manageUsers.messages.createFailed');
            setModalError(err.response?.data?.message || errorMessage);
        } finally {
            setIsSubmitting(false);
             setTimeout(() => setSuccess(''), 4000);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <KeyRound size={28} className="text-apple-blue" />
                    <h1 className="text-2xl sm:text-3xl font-semibold">{t('manageUsers.title')}</h1>
                </div>
                <Button variant="primary" onClick={openCreateModal} iconLeft={<PlusCircle size={18} />}>
                    {t('manageUsers.addNewUser')}
                </Button>
            </div>
            
            {success && <div className="p-3 bg-green-100 text-apple-green rounded-apple"><CheckCircle2 className="inline mr-2" />{success}</div>}
            {error && <div className="p-3 bg-red-100 text-apple-red rounded-apple"><AlertTriangle className="inline mr-2" />{error}</div>}

            <Card>
                {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-apple-gray-200">
                            <thead className="bg-apple-gray-50 dark:bg-apple-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left ...">{t('manageUsers.table.username')}</th>
                                    <th className="px-4 py-3 text-left ...">{t('manageUsers.table.role')}</th>
                                    <th className="px-4 py-3 text-left ...">{t('manageUsers.table.status')}</th>
                                    <th className="px-4 py-3 text-left ...">{t('manageUsers.table.createdAt')}</th>
                                    <th className="px-4 py-3 text-center ...">{t('manageUsers.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-apple-gray-900 divide-y divide-apple-gray-200">
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="px-4 py-3 ...">{user.username}</td>
                                        <td className="px-4 py-3 ..."><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{t(`manageUsers.roles.${user.role}`)}</span></td>
                                        <td className="px-4 py-3 ..."><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{user.isActive ? t('manageUsers.status.active') : t('manageUsers.status.disabled')}</span></td>
                                        <td className="px-4 py-3 ...">{format(parseISO(user.createdAt), 'MMM d, yyyy')}</td>
                                        <td className="px-4 py-3 text-center ...">
                                            <div className="flex justify-center space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} className="p-1"><Edit size={16} /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user._id, user.username)} className="p-1 text-apple-red"><Trash2 size={16} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? t('manageUsers.modal.editTitle') : t('manageUsers.modal.createTitle')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {modalError && <p className="p-3 text-sm bg-red-100 text-apple-red rounded-apple flex items-center"><AlertTriangle size={18} className="mr-2"/>{modalError}</p>}
                        <Input label={t('manageUsers.modal.username')} id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <Input label={isEditing ? t('manageUsers.modal.passwordEdit') : t('manageUsers.modal.password')} id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditing} />
                        <Select label={t('manageUsers.modal.role')} id="role" value={role} onChange={(e) => setRole(e.target.value)} options={[{value: 'staff', label: t('manageUsers.roles.staff')}, {value: 'admin', label: t('manageUsers.roles.admin')}]} />
                        <div className="flex items-center space-x-2">
                             <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="form-checkbox h-4 w-4 rounded text-apple-blue" />
                             <label htmlFor="isActive" className="text-sm">{t('manageUsers.modal.userIsActive')}</label>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-apple-gray-200">
                             <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>{t('manageUsers.modal.cancel')}</Button>
                             <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>{isEditing ? t('manageUsers.modal.saveChanges') : t('manageUsers.modal.createUser')}</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ManageUsersPage;