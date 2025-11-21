// client/src/pages/Customers/CustomerFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { trackEvent } from '../../utils/pixel';
import { useTranslation } from 'react-i18next';
import {
    fetchCustomerById,
    createNewCustomer,
    updateExistingCustomer
} from '../../services/api';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Spinner from '../../components/UI/Spinner';
import { UserPlus, Edit3, Save, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CustomerFormPage = ({ mode }) => { // mode will be 'create' or 'edit'
    const { id } = useParams(); // For edit mode
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const [loading, setLoading] = useState(false); // For fetching data in edit mode
    const [saving, setSaving] = useState(false);   // For submitting form
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditMode = mode === 'edit';

    // Fetch customer data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadCustomer = async () => {
                setLoading(true);
                setError('');
                try {
                    const { data } = await fetchCustomerById(id);
                    setFormData({
                        name: data.name || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        address: data.address || '',
                    });
                } catch (err) {
                    setError(err.response?.data?.message || t('customerForm.messages.fetchFailed', { id }));
                    console.error("Fetch Customer Error (Edit):", err);
                } finally {
                    setLoading(false);
                }
            };
            loadCustomer();
        } else if (!isEditMode) {
            // Reset form for create mode if navigating back from edit or similar
            setFormData({ name: '', phone: '', email: '', address: '' });
        }
    }, [isEditMode, id, t]); // Only re-run if mode or id changes

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (!formData.name || !formData.phone) {
            setError(t('customerForm.validation.namePhoneRequired'));
            setSaving(false);
            return;
        }

        try {
            if (isEditMode) {
                const { data: updatedCustomer } = await updateExistingCustomer(id, formData);
                setSuccess(t('customerForm.messages.updateSuccess', { name: updatedCustomer.name }));
            } else {
                const { data: newCustomer } = await createNewCustomer(formData);
                setSuccess(t('customerForm.messages.createSuccess', { name: newCustomer.name }));
                
                // --- META PIXEL EVENT: CUSTOMER CREATED ---
                trackEvent('CompleteRegistration', {
                    content_name: 'New Customer Created',
                    status: 'registered', // Custom status to indicate completion
                });
                // ------------------------------------------

                setTimeout(() => navigate('/app/customers'), 1500);
            }
        } catch (err) {
            const errorMessage = isEditMode 
                ? t('customerForm.messages.updateFailed')
                : t('customerForm.messages.createFailed');
            setError(err.response?.data?.message || errorMessage);
            console.error("Customer Form Submit Error:", err);
        } finally {
            setSaving(false);
            if (!isEditMode && !error) {  // Clear form only on successful creation
                 // setFormData({ name: '', phone: '', email: '', address: '' }); // Or let redirect handle it
            }
            setTimeout(() => { setSuccess(''); setError(''); }, 4000);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    // If in edit mode and there was an error fetching the customer (and formData is still default)
    if (isEditMode && error && !formData.name) {
        return (
            <div className="text-center py-10 max-w-xl mx-auto">
                <Card>
                    <AlertTriangle size={48} className="mx-auto text-apple-red mb-4" />
                    <p className="text-xl text-apple-red">{error}</p>
                    <Link to="/app/customers">
                        <Button variant="secondary" className="mt-6">{t('customerForm.backToCustomers')}</Button>
                    </Link>
                </Card>
            </div>
        );
    }


    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
                <Link to="/app/customers" className="p-1.5 rounded-full hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800">
                    <ArrowLeft size={22} className="text-apple-gray-600 dark:text-apple-gray-400" />
                </Link>
                {isEditMode ? <Edit3 size={28} className="text-apple-blue" /> : <UserPlus size={28} className="text-apple-blue" />}
                <h1 className="text-2xl sm:text-3xl font-semibold">
                    {isEditMode ? t('customerForm.editTitle') : t('customerForm.addTitle')}
                </h1>
            </div>

            {success && (
                <div className="p-3 mb-4 bg-green-100 text-apple-green rounded-apple border border-green-300 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30">
                    <div className="flex items-center"><CheckCircle2 size={20} className="mr-2"/>{success}</div>
                </div>
            )}
            {error && (
                 <div className="p-3 mb-4 bg-red-100 text-apple-red rounded-apple border border-red-300 dark:border-red-700 dark:text-red-300 dark:bg-red-900/30">
                    <div className="flex items-center"><AlertTriangle size={20} className="mr-2"/>{error}</div>
                </div>
            )}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 p-2 sm:p-0"> {/* No Card padding if form has its own */}
                    <Input
                        label={t('customerForm.form.fullName')}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('customerForm.form.namePlaceholder')}
                    />
                    <Input
                        label={t('customerForm.form.phoneNumber')}
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder={t('customerForm.form.phonePlaceholder')}
                    />
                    <Input
                        label={t('customerForm.form.emailAddress')}
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('customerForm.form.emailPlaceholder')}
                    />
                    <Input
                        label={t('customerForm.form.address')}
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder={t('customerForm.form.addressPlaceholder')}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => navigate('/app/customers')} disabled={saving}>
                            {t('customerForm.actions.cancel')}
                        </Button>
                        <Button type="submit" variant="primary" isLoading={saving} iconLeft={<Save size={16} />}>
                            {isEditMode ? t('customerForm.actions.saveChanges') : t('customerForm.actions.createCustomer')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CustomerFormPage;