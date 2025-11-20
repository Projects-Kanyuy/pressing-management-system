// client/src/pages/Admin/ManageUsersPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext'; // To get the logged-in user's plan
import { usePlans } from '../../hooks/usePlans'; // To get details of all plans
import { fetchUsersApi, createStaffUserApi, updateUserByIdApi, deleteUserApi } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Spinner from '../../components/UI/Spinner';
import { KeyRound, PlusCircle, Edit, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageUsersPage = () => {
    const { t } = useTranslation();
    const { user: loggedInUser } = useAuth();
    const { plans, loading: plansLoading } = usePlans();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [isActive, setIsActive] = useState(true);
    const [modalError, setModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [planDetails, setPlanDetails] = useState(null);

    // This derived state will automatically update when plans or the user's plan changes
    const staffLimitReached = planDetails ? users.length >= planDetails.limits.maxStaff : false;

    // Effect to find the current user's plan details from the fetched list of all plans
    useEffect(() => {
        if (!plansLoading && loggedInUser?.plan && plans.length > 0) {
            const currentPlanDetails = plans.find(p => p.name === loggedInUser.plan);
            setPlanDetails(currentPlanDetails);
        }
    }, [plansLoading, loggedInUser, plans]);

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
    }, [t]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);
    
    // Timer effect for success/error messages
     useEffect(() => {
        let timer;
        if (success || error) {
            timer = setTimeout(() => { setSuccess(''); setError(''); }, 4000);
        }
        return () => clearTimeout(timer);
    }, [success, error]);

    const openCreateModal = () => {
        // Enforce the plan limit before opening the modal
        if (staffLimitReached) {
            toast.error(
                (t) => (
                    <div className="flex flex-col items-center gap-2">
                        <span>Staff limit reached for your '{loggedInUser.plan}' plan.</span>
                        <Link 
                            to="/pricing" 
                            onClick={() => toast.dismiss(t.id)}
                            className="font-bold underline text-apple-blue"
                        >
                            Upgrade Your Plan
                        </Link>
                    </div>
                ), 
                { duration: 6000 }
            );
            return;
        }
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
        setPassword('');
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
                loadUsers();
            } catch (err) {
                setError(err.response?.data?.message || t('manageUsers.messages.deleteFailed'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setIsSubmitting(true);
        
        if (!isEditing && staffLimitReached) {
            setModalError(`Your plan limit of ${planDetails.limits.maxStaff} staff members has been reached.`);
            setIsSubmitting(false);
            return;
        }

        const payload = { username, role, isActive };
        if (!isEditing && password) {
            payload.password = password;
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
            loadUsers();
        } catch (err) {
            const errorMessage = isEditing 
                ? t('manageUsers.messages.updateFailed')
                : t('manageUsers.messages.createFailed');
            setModalError(err.response?.data?.message || errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                    <KeyRound size={28} className="text-apple-blue" />
                    <h1 className="text-2xl sm:text-3xl font-semibold">{t('manageUsers.title')}</h1>
                </div>
                {planDetails && (
                     <div className="text-right">
                        <Button 
                            variant="primary" 
                            onClick={openCreateModal} 
                            iconLeft={<PlusCircle size={18} />} 
                            disabled={staffLimitReached}
                        >
                            {t('manageUsers.addNewUser')}
                        </Button>
                        <p className={`text-sm mt-1 ${staffLimitReached ? 'text-red-500 font-semibold' : 'text-apple-gray-500'}`}>
                            {users.length} / {planDetails.limits.maxStaff} staff members used
                        </p>
                     </div>
                )}
            </div>
            
            {success && <div className="p-3 bg-green-100 text-apple-green rounded-apple"><CheckCircle2 className="inline mr-2" />{success}</div>}
            {error && <div className="p-3 bg-red-100 text-apple-red rounded-apple"><AlertTriangle className="inline mr-2" />{error}</div>}

            <Card>
                {loading || plansLoading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-apple-gray-200 dark:divide-apple-gray-700">
                            <thead className="bg-apple-gray-50 dark:bg-apple-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">{t('manageUsers.table.username')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">{t('manageUsers.table.role')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">{t('manageUsers.table.status')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">{t('manageUsers.table.createdAt')}</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-apple-gray-500 uppercase tracking-wider">{t('manageUsers.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-apple-gray-900 divide-y divide-apple-gray-200 dark:divide-apple-gray-700">
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="px-4 py-3 whitespace-nowrap">{user.username}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{t(`manageUsers.roles.${user.role}`)}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{user.isActive ? t('manageUsers.status.active') : t('manageUsers.status.disabled')}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap">{format(parseISO(user.createdAt), 'MMM d, yyyy')}</td>
                                        <td className="px-4 py-3 text-center">
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