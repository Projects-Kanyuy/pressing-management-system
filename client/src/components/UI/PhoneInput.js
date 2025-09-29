// client/src/components/UI/PhoneInput.js

import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Keep the base styles
import './PhoneInput.css'; // Our custom styles will override the base

const CustomPhoneInput = React.forwardRef(({ label, value, onChange, onCountryChange, ...props }, ref) => {
    return (
        <div>
            {label && <label className="block text-sm font-medium mb-1 text-apple-gray-700 dark:text-apple-gray-300">{label}</label>}
            
            {/* --- THIS IS THE CHANGE --- */}
            {/* We wrap the PhoneInput component in a div with our custom class */}
            <div className="phone-input-wrapper">
                <PhoneInput
                    international
                    defaultCountry="CM"
                    value={value}
                    onChange={onChange}
                    onCountryChange={onCountryChange}
                    {...props}
                />
            </div>
        </div>
    );
});

export default CustomPhoneInput;