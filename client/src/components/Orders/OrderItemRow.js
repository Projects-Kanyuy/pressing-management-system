// client/src/components/Orders/OrderItemRow.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { X } from 'lucide-react';
import { useAppSettings } from '../../contexts/SettingsContext';
const OrderItemRow = ({
    item,
    index,
    onRemove,
    onChange,
    itemTypes = [],
    serviceTypes = [],
    calculatedPrice
}) => {
    // This handler directly calls the function passed from the parent.
    // It's crucial that `onChange` is the `handleItemChange` function from CreateOrderForm.
    const handleFieldChange = (field, value) => {
        onChange(item.id, field, value);
    };
       const { t } = useTranslation();
  const { settings } = useAppSettings();
    const currencySymbol = settings.defaultCurrencySymbol;

    return (
        <div className="p-4 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-md shadow-apple-sm bg-apple-gray-50 dark:bg-apple-gray-800/30">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-apple-gray-700 dark:text-apple-gray-300">{t('orderItemRow.itemNumber', { number: index + 1 })}</h4>
                <Button
                    type="button"
                    onClick={onRemove}
                    variant="ghost"
                    size="sm"
                    className="text-apple-red hover:bg-red-100/50 dark:hover:bg-red-900/30 p-1 -mr-1 -mt-1"
                    title={t('orderItemRow.accessibility.removeItem')}
                    aria-label={t('orderItemRow.accessibility.removeItemWithNumber', { number: index + 1 })}
                >
                    <X size={18} />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-end">
                <div className="md:col-span-3">
                    <Select
                        label={t('orderItemRow.itemType')}
                        id={`itemType-${item.id}`}
                        value={item.itemType} // This is bound to the state from the parent
                        onChange={(e) => handleFieldChange('itemType', e.target.value)}
                        options={itemTypes.map(type => ({ value: type, label: type }))}
                        placeholder={t('orderItemRow.placeholders.selectItemType')}
                        required
                        className="mb-0"
                    />
                </div>
                <div className="md:col-span-3">
                    <Select
                        label={t('orderItemRow.serviceType')}
                        id={`serviceType-${item.id}`}
                        value={item.serviceType}
                        onChange={(e) => handleFieldChange('serviceType', e.target.value)}
                        options={serviceTypes}
                        placeholder={t('orderItemRow.placeholders.selectServiceType')}
                        required
                        className="mb-0"
                    />
                </div>
                <div className="md:col-span-1">
                    <Input
                        label={t('orderItemRow.quantity')}
                        id={`quantity-${item.id}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value, 10) || 1)}
                        min="1"
                        required
                        className="mb-0"
                    />
                </div>
                <div className="md:col-span-3">
                     <Input
                        label={t('orderItemRow.specialInstructions')}
                        id={`specialInstructions-${item.id}`}
                        value={item.specialInstructions}
                        onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
                        placeholder={t('orderItemRow.placeholders.specialInstructions')}
                        className="mb-0"
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor={`itemPrice-${item.id}`} className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 ">
                        {t('orderItemRow.linePrice')}
                    </label>
                    <div
                        id={`itemPrice-${item.id}`}
                        className="h-10 flex items-center justify-end px-3 py-2 border border-apple-gray-300 dark:border-apple-gray-700 rounded-apple shadow-sm bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-100 sm:text-sm"
                    >
                        <span className="font-medium">
                            {currencySymbol}{(calculatedPrice || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderItemRow;