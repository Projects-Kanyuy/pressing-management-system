// client/src/components/UI/LanguageSwitcher.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'default' }) => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    const handleLanguageChange = (languageCode) => {
        i18n.changeLanguage(languageCode);
        // Save language preference to localStorage
        localStorage.setItem('i18nextLng', languageCode);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    if (variant === 'simple') {
        // Simple toggle for mobile or compact areas
        return (
            <button
                onClick={() => handleLanguageChange(i18n.language === 'en' ? 'fr' : 'en')}
                className="flex items-center space-x-1 px-2 py-1 text-sm font-medium hover:text-apple-blue transition-colors"
                aria-label="Switch language"
            >
                <Globe size={16} />
                <span>{currentLanguage.flag}</span>
            </button>
        );
    }

    // Default dropdown version
    return (
        <div className="relative group">
            <button
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium hover:text-apple-blue transition-colors rounded-apple hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
                aria-label="Select language"
            >
                <Globe size={16} />
                <span>{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.name}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-apple-gray-800 rounded-apple shadow-apple-lg border border-apple-gray-200 dark:border-apple-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageChange(language.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 flex items-center space-x-2 transition-colors ${
                                i18n.language === language.code 
                                    ? 'bg-apple-blue/10 text-apple-blue font-medium' 
                                    : 'text-apple-gray-700 dark:text-apple-gray-300'
                            }`}
                        >
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                            {i18n.language === language.code && (
                                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
