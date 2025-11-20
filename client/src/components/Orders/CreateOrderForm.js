// client/src/components/Orders/CreateOrderForm.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext'; 
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import DatePicker from '../UI/DatePicker';
import OrderItemRow from './OrderItemRow';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import Card from '../UI/Card';
import { trackEvent } from '../../utils/pixel'; 
import {
  createNewOrder,
  updateExistingOrder,
  fetchCustomers,
  fetchAppSettings,
  fetchPrices,
} from '../../services/api';
import {
  Plus,
  Save,
  UserPlus,
  Search,
  UserCheck,
  Edit2,
  CheckSquare,
  XSquare,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import {
  format,
  parseISO,
  isValid as isValidDate,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { useAppSettings } from '../../contexts/SettingsContext';
const CreateOrderForm = ({ initialOrderData, isEditMode = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
      const { settings, loadingSettings } = useAppSettings();
    const { user } = useAuth();
    // --- STATE FOR DYNAMIC DATA (PRICING, SERVICES, ETC.) ---
    const [operationalData, setOperationalData] = useState({
        itemTypes: [],
        serviceTypes: [],
        priceList: [],
        currencySymbol: '$', // Default, will be updated from settings
        loading: true,
    });

    // --- FORM DATA STATE ---
    const getNewItem = useCallback(() => ({
        id: Date.now() + Math.random(),
        itemType: '',
        serviceType: '',
        quantity: 1,
        specialInstructions: '',
    }), []);

    const [items, setItems] = useState([getNewItem()]);
    const [discountType, setDiscountType] = useState('none');
    const [discountValueState, setDiscountValueState] = useState('0');
    const [amountPaid, setAmountPaid] = useState('0');
    const [notes, setNotes] = useState('');
    const defaultPickupDateOnly = format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const defaultPickupTime = '17:00';
    const [expectedPickupDateOnly, setExpectedPickupDateOnly] = useState(defaultPickupDateOnly);
    const [expectedPickupTime, setExpectedPickupTime] = useState(defaultPickupTime);

    // --- CUSTOMER STATE ---
    const [customerInput, setCustomerInput] = useState({ name: '', phone: '', email: '', address: '' });
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [searchedCustomers, setSearchedCustomers] = useState([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [customerSelectionMode, setCustomerSelectionMode] = useState(isEditMode && initialOrderData?.customer?._id ? 'existing' : 'new');

    // --- UI/MODAL STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [orderDataForReview, setOrderDataForReview] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const loadOperationalData = async () => {
            try {
                const [settingsRes, pricesRes] = await Promise.all([fetchAppSettings(), fetchPrices()]);
                setOperationalData({
                    itemTypes: settingsRes.data.itemTypes || [],
                    serviceTypes: settingsRes.data.serviceTypes || [],
                    priceList: pricesRes.data || [],
                    currencySymbol: settingsRes.data.defaultCurrencySymbol || 'FCFA',
                    loading: false,
                });
            } catch (err) {
                setError(t('createOrder.form.validation.couldNotLoadData'));
                console.error("Failed to load operational data:", err);
                setOperationalData(prev => ({ ...prev, loading: false }));
            }
        };
        loadOperationalData();
    }, []);
const currencySymbol = settings.defaultCurrencySymbol;
    // --- FORM POPULATION FOR EDIT MODE ---
    useEffect(() => {
        if (isEditMode && initialOrderData) {
            if (initialOrderData.customer) {
                setCustomerInput({ name: initialOrderData.customer.name || '', phone: initialOrderData.customer.phone || '', email: initialOrderData.customer.email || '', address: initialOrderData.customer.address || '' });
                setSelectedCustomerId(initialOrderData.customer._id);
                setCustomerSelectionMode('existing');
            }
            setItems(initialOrderData.items?.map(item => ({ ...item, id: item._id || Date.now() + Math.random(), quantity: item.quantity || 1 })) || [getNewItem()]);
            if (initialOrderData.expectedPickupDate && isValidDate(parseISO(initialOrderData.expectedPickupDate))) {
                const initialDate = parseISO(initialOrderData.expectedPickupDate);
                setExpectedPickupDateOnly(format(initialDate, 'yyyy-MM-dd'));
                setExpectedPickupTime(format(initialDate, 'HH:mm'));
            } else {
                setExpectedPickupDateOnly(defaultPickupDateOnly);
                setExpectedPickupTime(defaultPickupTime);
            }
            setDiscountType(initialOrderData.discountType || 'none');
            setDiscountValueState(String(initialOrderData.discountValue || 0));
            setAmountPaid(String(initialOrderData.amountPaid || 0));
            setNotes(initialOrderData.notes || '');
        }
    }, [initialOrderData, isEditMode, getNewItem, defaultPickupDateOnly, defaultPickupTime]);

    // --- HANDLERS ---
    const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'quantity' ? (parseInt(value, 10) || 1) : value } : item));
    const handleAddItem = () => setItems([...items, getNewItem()]);
    const handleRemoveItem = (id) => setItems(items.filter(item => item.id !== id));
    const handleCustomerInputChange = (e) => setCustomerInput({ ...customerInput, [e.target.name]: e.target.value });
    const handleCustomerSearchChange = async (e) => {
        const query = e.target.value;
        setCustomerSearchQuery(query);
        if (query.length > 1) {
            setIsSearchingCustomers(true);
            try { const { data } = await fetchCustomers(query); setSearchedCustomers(data?.customers || []); } catch (err) { console.error(err); setSearchedCustomers([]); } finally { setIsSearchingCustomers(false); }
        } else { setSearchedCustomers([]); }
    };
    const handleSelectCustomer = (customer) => {
        setCustomerInput({ name: customer.name, phone: customer.phone, email: customer.email || '', address: customer.address || '' });
        setSelectedCustomerId(customer._id);
        setCustomerSearchQuery(''); setSearchedCustomers([]); setCustomerSelectionMode('existing');
    };
    const handleCreateNewCustomerToggle = () => { setCustomerSelectionMode('new'); setSelectedCustomerId(null); };
    const handleEditFromReview = () => setShowConfirmationModal(false);

    // --- DYNAMIC CALCULATIONS ---
    const getItemPrice = useCallback((itemType, serviceType) => {
        if (!itemType || !serviceType) return 0;
         const serviceTypeToCompare = serviceType.toLowerCase();
        const priceEntry = operationalData.priceList.find(
            p => p.itemType === itemType && p.serviceType.toLowerCase() === serviceTypeToCompare
        );
        if (!priceEntry) {
            console.log(`[getItemPrice] No price found for Item: '${itemType}', Service: '${serviceTypeToCompare}'. Checking against price list:`, operationalData.priceList);
        }
        return priceEntry ? priceEntry.price : 0;
    }, [operationalData.priceList]);

    const subTotal = useMemo(() =>
        parseFloat(items.reduce((sum, item) => {
            const pricePerUnit = getItemPrice(item.itemType, item.serviceType);
            const qty = parseInt(item.quantity, 10) || 0;
            return sum + (pricePerUnit * qty);
        }, 0).toFixed(2)),
        [items, getItemPrice]
    );

    const { calculatedDiscountAmount, finalTotalAmount } = useMemo(() => {
        let discount = 0;
        const val = parseFloat(discountValueState) || 0;
        if (discountType === 'percentage' && subTotal > 0 && val > 0) discount = (subTotal * val) / 100;
        else if (discountType === 'fixed' && val > 0) discount = val;
        if (discount > subTotal) discount = subTotal;
        const finalDiscount = parseFloat(discount.toFixed(2));
        const finalTotal = parseFloat((subTotal - finalDiscount).toFixed(2));
        return { calculatedDiscountAmount: finalDiscount, finalTotalAmount: finalTotal };
    }, [subTotal, discountType, discountValueState]);

    const balanceDue = useMemo(() => Math.max(0, finalTotalAmount - (parseFloat(amountPaid) || 0)), [finalTotalAmount, amountPaid]);

    // --- SUBMISSION LOGIC ---
    const handleReviewOrder = (e) => {
        e.preventDefault(); setError('');
        if (customerSelectionMode === 'new' && (!customerInput.name || !customerInput.phone)) { setError(t('createOrder.form.validation.customerNamePhoneRequired')); return; }
        if (customerSelectionMode === 'existing' && !selectedCustomerId && !isEditMode) { setError(t('createOrder.form.validation.selectCustomerRequired')); return; }
        if (items.some(item => !item.itemType || !item.serviceType || !item.quantity || parseInt(item.quantity, 10) < 1)) { setError(t('createOrder.form.validation.itemsRequired')); return; }
        if (!expectedPickupDateOnly || !isValidDate(parseISO(expectedPickupDateOnly)) || !expectedPickupTime) { setError(t('createOrder.form.validation.pickupDateRequired')); return; }

        const [hours, minutes] = expectedPickupTime.split(':').map(Number);
        let combinedDateTime = setSeconds(setMinutes(setHours(parseISO(expectedPickupDateOnly), hours), minutes), 0);
        if (!isValidDate(combinedDateTime)) { setError(t('createOrder.form.validation.invalidDateTime')); return; }

        setOrderDataForReview({
            isEditMode, customer: { ...customerInput, id: selectedCustomerId }, customerSelectionMode,
            items: items.map(({ id, ...rest }) => ({...rest, quantity: parseInt(rest.quantity, 10) || 1, serviceType: rest.serviceType.toLowerCase()})), // Ensure lowercase on review
            expectedPickupDate: combinedDateTime.toISOString(), subTotalAmount: subTotal,
            discountType, discountValue: parseFloat(discountValueState) || 0,
            calculatedDiscountAmount, finalTotalAmount, amountPaid: parseFloat(amountPaid) || 0, notes, balanceDue
        });
        setShowConfirmationModal(true);
    };

   const handleConfirmAndCreateOrder = async () => {
    if (!orderDataForReview) { setError(t('createOrder.form.validation.internalError')); setShowConfirmationModal(false); return; }
    setIsLoading(true); setError(''); setShowConfirmationModal(false);
    const payload = {
        items: orderDataForReview.items,
        expectedPickupDate: orderDataForReview.expectedPickupDate,
        subTotalAmount: orderDataForReview.subTotalAmount, discountType: orderDataForReview.discountType,
        discountValue: orderDataForReview.discountValue, amountPaid: orderDataForReview.amountPaid, notes: orderDataForReview.notes,
    };
    if (orderDataForReview.customerSelectionMode === 'existing' && orderDataForReview.customer.id) {
        payload.customerId = orderDataForReview.customer.id;
        payload.customerDetailsToUpdate = { name: orderDataForReview.customer.name, phone: orderDataForReview.customer.phone, email: orderDataForReview.customer.email, address: orderDataForReview.customer.address };
    } else {
        payload.customerName = orderDataForReview.customer.name; payload.customerPhone = orderDataForReview.customer.phone;
        payload.customerEmail = orderDataForReview.customer.email; payload.customerAddress = orderDataForReview.customer.address;
    }

    try {
        const response = isEditMode && initialOrderData?._id ? await updateExistingOrder(initialOrderData._id, payload) : await createNewOrder(payload);
        if (isEditMode) {
            trackEvent('CustomizeProduct', {
                content_name: `Order Edited - #${response.data.receiptNumber}`,
                content_ids: [response.data._id],
                currency: operationalData.currencySymbol,
            });
        } else {
            // Event for successfully creating a new order
            trackEvent('Lead', {
                content_name: `New Order Created - #${response.data.receiptNumber}`,
                value: response.data.totalAmount, 
                currency: operationalData.currencySymbol,
            });
        }
        alert(t(isEditMode ? 'createOrder.form.validation.orderUpdated' : 'createOrder.form.validation.orderCreated', { receiptNumber: response.data.receiptNumber }));
        navigate(isEditMode ? `/app/orders/${response.data._id}` : '/app/dashboard');
    } catch (err) { 
        setError(err.response?.data?.message || t(isEditMode ? 'createOrder.form.validation.failedToSave' : 'createOrder.form.validation.failedToCreate'));
    } finally { 
        setIsLoading(false); 
    }
};
    if (operationalData.loading) {
        return <div className="p-8 flex justify-center items-center"><Spinner size="lg" /><p className="ml-1 mt-2 text-sm text-apple-gray-500">{t('createOrder.form.loadingData')}</p></div>;
    }

    if (!operationalData.loading && operationalData.itemTypes.length === 0) {
        return (
            <Card>
                <div className="p-6 text-center">
                    <AlertTriangle size={32} className="mx-auto text-orange-500 mb-4" />
                    <h3 className="font-semibold text-lg">{t('createOrder.form.setupRequired')}</h3>
                    <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mt-2">{t('createOrder.form.noItemTypes')}</p>
                    <Link to="/app/admin/settings">
                        <Button className="mt-4">{t('createOrder.form.goToSettings')}</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <>
            <form onSubmit={handleReviewOrder} className="space-y-8 divide-y divide-apple-gray-200 dark:divide-apple-gray-700">
                {error && ( <div className="p-3 mb-4 bg-red-100 text-apple-red rounded-apple border border-red-300 dark:border-red-700 dark:text-red-300 dark:bg-red-900/30"> <div className="flex items-center"> <AlertTriangle size={20} className="mr-2 flex-shrink-0" /> <span>{error}</span> </div> </div> )}
                <div className="pt-2">
                    <h3 className="text-xl font-semibold leading-7 text-apple-gray-900 dark:text-apple-gray-100">{t('createOrder.form.customerInfo.title')}</h3>
                    <div className="mt-2 mb-4 flex space-x-4"> <Button type="button" onClick={() => { setCustomerSelectionMode('existing'); setSelectedCustomerId(null); setCustomerInput({ name: '', phone: '', email: '', address: '' }); }} variant={customerSelectionMode === 'existing' ? 'primary' : 'secondary'} iconLeft={<Search size={16}/>}>{t('createOrder.form.customerInfo.existingCustomer')}</Button> <Button type="button" onClick={handleCreateNewCustomerToggle} variant={customerSelectionMode === 'new' ? 'primary' : 'secondary'} iconLeft={<UserPlus size={16}/>}>{t('createOrder.form.customerInfo.newCustomer')}</Button> </div>
                    {customerSelectionMode === 'existing' && ( <div className="space-y-4 mb-4"> <Input label={t('createOrder.form.customerInfo.searchCustomer')} id="customerSearch" value={customerSearchQuery} onChange={handleCustomerSearchChange} placeholder={t('createOrder.form.customerInfo.searchPlaceholder')} prefixIcon={isSearchingCustomers ? <Spinner size="sm"/> : <Search size={16}/>} /> {searchedCustomers.length > 0 && ( <ul className="max-h-48 overflow-y-auto border border-apple-gray-300 dark:border-apple-gray-700 rounded-apple-md divide-y divide-apple-gray-200 dark:divide-apple-gray-700 bg-white dark:bg-apple-gray-800"> {searchedCustomers.map(cust => ( <li key={cust._id} onClick={() => handleSelectCustomer(cust)} className="p-3 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700/50 cursor-pointer"> <p className="font-medium text-apple-gray-800 dark:text-apple-gray-200">{cust.name}</p> <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">{cust.phone} {cust.email && `- ${cust.email}`}</p> </li> ))} </ul> )} {selectedCustomerId && <p className="mt-2 text-sm text-apple-green flex items-center"><UserCheck size={16} className="mr-1"/> {t('createOrder.form.customerInfo.selected')}: {customerInput.name} ({customerInput.phone})</p>} </div> )}
                    <div className={`mt-2 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6 ${customerSelectionMode === 'existing' && !selectedCustomerId && !isEditMode && 'opacity-60 pointer-events-none'}`}>
                        <div className="sm:col-span-3"> <Input label={t('createOrder.form.customerInfo.fullName')} id="customerNameInput" name="name" value={customerInput.name} onChange={handleCustomerInputChange} required={customerSelectionMode === 'new'} /> </div>
                        <div className="sm:col-span-3"> <Input label={t('createOrder.form.customerInfo.phoneNumber')} id="customerPhoneInput" name="phone" type="tel" value={customerInput.phone} onChange={handleCustomerInputChange} required={customerSelectionMode === 'new'} /> </div>
                        <div className="sm:col-span-3"> <Input label={t('createOrder.form.customerInfo.emailAddress')} id="customerEmailInput" name="email" type="email" value={customerInput.email} onChange={handleCustomerInputChange} /> </div>
                        <div className="sm:col-span-3"> <Input label={t('createOrder.form.customerInfo.address')} id="customerAddressInput" name="address" value={customerInput.address} onChange={handleCustomerInputChange} /> </div>
                    </div>
                </div>

                <div className="pt-8">
                    <h3 className="text-xl font-semibold leading-7 text-apple-gray-900 dark:text-apple-gray-100">{t('createOrder.form.items.title')}</h3>
                    <div className="mt-6 space-y-4">
                        {items.map((item, index) => {
                            const pricePerUnit = getItemPrice(item.itemType, item.serviceType);
                            const itemPrice = pricePerUnit * (parseInt(item.quantity, 10) || 0);
                            return (
                                <OrderItemRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onRemove={() => handleRemoveItem(item.id)}
                                    onChange={handleItemChange}
                                    itemTypes={operationalData.itemTypes}
                                    serviceTypes={operationalData.serviceTypes.map(s => ({
                                        value: s.toLowerCase().trim(), // The value to be sent to backend
                                        label: s                       // The text to be shown to the user
                                    }))}
                                    calculatedPrice={itemPrice}
                                    currencySymbol={operationalData.currencySymbol}
                                />
                            );
                        })}
                        <Button type="button" onClick={handleAddItem} variant="secondary" iconLeft={<Plus size={16}/>}>{t('createOrder.form.items.addItem')}</Button>
                    </div>
                </div>

                <div className="pt-8">
                     <h3 className="text-xl font-semibold leading-7 text-apple-gray-900 dark:text-apple-gray-100">{t('createOrder.form.summary.title')}</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                        <div className="sm:col-span-3"><Input label={`${t('createOrder.form.summary.subtotal')} (${operationalData.currencySymbol})`} id="subTotal" type="text" value={subTotal.toFixed(2)} readOnly className="bg-apple-gray-100 dark:bg-apple-gray-800 cursor-default" /></div>
                        <div className="sm:col-span-3"> <Select label={t('createOrder.form.summary.discountType')} id="discountType" value={discountType} onChange={(e) => { setDiscountType(e.target.value); if (e.target.value === 'none') setDiscountValueState('0'); }} options={[ { value: 'none', label: t('createOrder.form.summary.noDiscount') }, { value: 'percentage', label: t('createOrder.form.summary.percentage') }, { value: 'fixed', label: `${t('createOrder.form.summary.fixedAmount')} (${operationalData.currencySymbol})` }]} /> </div>
                        {discountType !== 'none' && ( <div className="sm:col-span-3"> <Input label={`${t('createOrder.form.summary.discountValue')} ${discountType === 'percentage' ? '(%)' : `(${operationalData.currencySymbol})`}`} id="discountValueState" type="number" value={discountValueState} onChange={(e) => setDiscountValueState(e.target.value)} min="0" step="0.01" /> </div> )}
                        <div className="sm:col-span-3"><Input label={`${t('createOrder.form.summary.calculatedDiscount')} (${operationalData.currencySymbol})`} id="calculatedDiscountDisplay" type="text" value={calculatedDiscountAmount.toFixed(2)} readOnly className="bg-apple-gray-100 dark:bg-apple-gray-800 cursor-default" /></div>
                        <div className="sm:col-span-3"><Input label={`${t('createOrder.form.summary.finalTotal')} (${operationalData.currencySymbol})`} id="finalTotalAmount" type="text" value={finalTotalAmount.toFixed(2)} readOnly className="font-semibold bg-apple-gray-100 dark:bg-apple-gray-800 cursor-default" /></div>
                        <div className="sm:col-span-3"><Input label={`${t('createOrder.form.summary.advancePaid')} (${operationalData.currencySymbol})`} id="amountPaid" name="amountPaid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} step="0.01" min="0" /></div>
                        <div className="sm:col-span-3"><Input label={`${t('createOrder.form.summary.balanceDue')} (${operationalData.currencySymbol})`} id="balanceDueDisplay" type="text" value={balanceDue.toFixed(2)} readOnly className={`font-semibold cursor-default ${balanceDue > 0 ? 'text-apple-red dark:text-red-400' : 'text-apple-green dark:text-green-400'} bg-apple-gray-100 dark:bg-apple-gray-800`} /></div>
                        <div className="sm:col-span-3"><DatePicker label={t('createOrder.form.summary.expectedPickupDate')} id="expectedPickupDateOnly" value={expectedPickupDateOnly} onChange={(e) => setExpectedPickupDateOnly(e.target.value)} required min={format(new Date(), 'yyyy-MM-dd')} /></div>
                        <div className="sm:col-span-3"><Input label={t('createOrder.form.summary.expectedPickupTime')} id="expectedPickupTime" type="time" value={expectedPickupTime} onChange={(e) => setExpectedPickupTime(e.target.value)} required /></div>
                        <div className="sm:col-span-6"> <label htmlFor="notes" className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1">{t('createOrder.form.summary.orderNotes')}</label> <textarea id="notes" name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="form-textarea block w-full sm:text-sm  border-apple-gray-300 focus:border-apple-blue focus:ring-apple-blue dark:bg-apple-gray-800 dark:border-apple-gray-700 dark:text-apple-gray-100 dark:focus:border-apple-blue rounded-apple shadow-apple-sm" /> </div>
                    </div>
                </div>

                <div className="pt-6 flex items-center justify-end gap-x-3">
                    <Button type="button" variant="secondary" onClick={() => navigate(isEditMode && initialOrderData?._id ? `/app/orders/${initialOrderData._id}` : '/app/dashboard')} disabled={isLoading}>{t('createOrder.form.actions.cancel')}</Button>
                    <Button type="submit" variant="primary" isLoading={isLoading} iconLeft={<CheckSquare size={18}/>}>
                        {isEditMode ? t('createOrder.form.actions.reviewChanges') : t('createOrder.form.actions.reviewOrder')}
                    </Button>
                </div>
            </form>

            {showConfirmationModal && orderDataForReview && (
                <Modal isOpen={showConfirmationModal} onClose={() => { if (!isLoading) setShowConfirmationModal(false); }} title={isEditMode ? t('createOrder.form.confirmModal.titleEdit') : t('createOrder.form.confirmModal.titleNew')} size="2xl">
                    <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
                        <h3 className="text-lg font-semibold text-apple-gray-800 dark:text-apple-gray-100">{t('createOrder.form.confirmModal.reviewDetails')}</h3>
                        <div className="p-3 border rounded-apple-md dark:border-apple-gray-700 bg-apple-gray-50 dark:bg-apple-gray-800/30"> <h4 className="font-medium mb-1 text-apple-gray-700 dark:text-apple-gray-200">{t('createOrder.form.confirmModal.customer')}</h4> <p><strong>{t('createOrder.form.confirmModal.name')}</strong> {orderDataForReview.customer.name || <span className="italic text-apple-red">{t('createOrder.form.confirmModal.missing')}</span>}</p> <p><strong>{t('createOrder.form.confirmModal.phone')}</strong> {orderDataForReview.customer.phone || <span className="italic text-apple-red">{t('createOrder.form.confirmModal.missing')}</span>}</p> {orderDataForReview.customer.email && <p><strong>{t('createOrder.form.confirmModal.email')}</strong> {orderDataForReview.customer.email}</p>} {orderDataForReview.customer.address && <p><strong>{t('createOrder.form.confirmModal.address')}</strong> {orderDataForReview.customer.address}</p>} </div>
                        <div className="p-3 border rounded-apple-md dark:border-apple-gray-700 bg-apple-gray-50 dark:bg-apple-gray-800/30"> <h4 className="font-medium mb-2 text-apple-gray-700 dark:text-apple-gray-200">{t('createOrder.form.confirmModal.items')}</h4> {orderDataForReview.items.length > 0 ? orderDataForReview.items.map((item, index) => { const itemPriceInReview = getItemPrice(item.itemType, item.serviceType) * (parseInt(item.quantity, 10) || 0); return ( <div key={index} className={`mb-2 pb-2 ${index < orderDataForReview.items.length - 1 ? 'border-b dark:border-apple-gray-700/50' : ''}`}> <div className="flex justify-between"> <span><strong>{item.quantity || 0}x {item.itemType || <span className="italic text-apple-red">{t('createOrder.form.confirmModal.missing')}</span>}</strong> - {t('createOrder.form.confirmModal.service')}: {item.serviceType || <span className="italic text-apple-red">{t('createOrder.form.confirmModal.missing')}</span>}</span> <span className="font-medium">{operationalData.currencySymbol}{itemPriceInReview.toFixed(2)}</span> </div> {item.specialInstructions && <p className="text-xs italic text-apple-gray-600 dark:text-apple-gray-400">{t('createOrder.form.confirmModal.instructions')}: {item.specialInstructions}</p>} </div> ); }) : <p className="italic text-apple-gray-500">{t('createOrder.form.confirmModal.noItems')}</p>} </div>
                        <div className="p-3 border rounded-apple-md dark:border-apple-gray-700 bg-apple-gray-50 dark:bg-apple-gray-800/30"> <h4 className="font-medium mb-1 text-apple-gray-700 dark:text-apple-gray-200">{t('createOrder.form.confirmModal.summary')}</h4> <p><strong>{t('createOrder.form.confirmModal.subtotal')}</strong> {operationalData.currencySymbol}{orderDataForReview.subTotalAmount.toFixed(2)}</p> {orderDataForReview.discountType !== 'none' && orderDataForReview.calculatedDiscountAmount > 0 && ( <p><strong>{t('createOrder.form.confirmModal.discount')} ({orderDataForReview.discountType === 'percentage' ? `${orderDataForReview.discountValue}%` : `${operationalData.currencySymbol}${orderDataForReview.discountValue.toFixed(2)}`}):</strong> -{operationalData.currencySymbol}{orderDataForReview.calculatedDiscountAmount.toFixed(2)}</p> )} <p className="text-base font-semibold"><strong>{t('createOrder.form.confirmModal.finalTotal')}</strong> {operationalData.currencySymbol}{orderDataForReview.finalTotalAmount.toFixed(2)}</p> <p><strong>{t('createOrder.form.confirmModal.advancePaid')}</strong> {operationalData.currencySymbol}{orderDataForReview.amountPaid.toFixed(2)}</p> <p className={`font-semibold ${orderDataForReview.balanceDue > 0 ? 'text-apple-red' : 'text-apple-green'}`}> <strong>{t('createOrder.form.confirmModal.balanceDue')}</strong> {operationalData.currencySymbol}{orderDataForReview.balanceDue.toFixed(2)} </p> <p><strong>{t('createOrder.form.confirmModal.expectedPickup')}</strong> {orderDataForReview.expectedPickupDate ? format(parseISO(orderDataForReview.expectedPickupDate), 'MMM d, yyyy, h:mm a') : <span className="italic text-apple-red">{t('createOrder.form.confirmModal.missing')}</span>}</p> {orderDataForReview.notes && <p className="mt-1"><strong>{t('createOrder.form.confirmModal.notes')}</strong> <span className="block whitespace-pre-wrap">{orderDataForReview.notes}</span></p>} </div>
                        <p className="pt-2 text-center font-semibold text-apple-gray-700 dark:text-apple-gray-200">{t('createOrder.form.confirmModal.isCorrect')}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t dark:border-apple-gray-700 flex flex-wrap justify-end gap-3"> <Button variant="secondary" onClick={handleEditFromReview} iconLeft={<Edit2 size={16}/>} disabled={isLoading}>{t('createOrder.form.confirmModal.edit')}</Button> <Button variant="ghost" onClick={() => setShowConfirmationModal(false)} disabled={isLoading} className="text-apple-red" iconLeft={<XSquare size={16}/>}>{t('common.cancel')}</Button> <Button variant="primary" onClick={handleConfirmAndCreateOrder} isLoading={isLoading} iconLeft={<Save size={16}/>}> {isEditMode ? t('createOrder.form.confirmModal.confirmSave') : t('createOrder.form.confirmModal.confirmCreate')} </Button> </div>
                </Modal>
            )}
        </>
    );
};
export default CreateOrderForm;