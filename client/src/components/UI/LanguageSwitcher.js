// client/src/components/UI/LanguageSwitcher.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'default' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (languageCode) => {
        i18n.changeLanguage(languageCode);
        localStorage.setItem('i18nextLng', languageCode);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    if (variant === 'simple') {
        // Enhanced simple toggle for mobile or compact areas
        return (
            <button
                onClick={() => handleLanguageChange(i18n.language === 'en' ? 'fr' : 'en')}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Switch language"
            >
                <div className="flex items-center justify-center">
                    <span className="text-lg transform group-hover:scale-110 transition-transform duration-200">
                        {currentLanguage.flag}
                    </span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {currentLanguage.nativeName}
                </div>
            </button>
        );
    }

    // Enhanced dropdown version
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium bg-white/80 dark:bg-apple-gray-800/80 backdrop-blur-sm border border-apple-gray-200/60 dark:border-apple-gray-700/60 rounded-xl hover:bg-white dark:hover:bg-apple-gray-800 hover:border-apple-blue/30 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-apple-gray-500 group-hover:text-apple-blue transition-colors duration-200" />
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <span className="hidden sm:inline text-apple-gray-700 dark:text-apple-gray-300 group-hover:text-apple-blue transition-colors duration-200">
                        {currentLanguage.nativeName}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-apple-gray-500 group-hover:text-apple-blue transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Enhanced dropdown menu */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div 
                        className="fixed inset-0 z-40 lg:hidden" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-apple-gray-800 rounded-xl shadow-xl border border-apple-gray-200/60 dark:border-apple-gray-700/60 backdrop-blur-sm z-50 overflow-hidden">
                        <div className="py-2">
                            {languages.map((language, index) => (
                                <button
                                    key={language.code}
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-all duration-200 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700/50 ${
                                        i18n.language === language.code 
                                            ? 'bg-apple-blue/5 text-apple-blue' 
                                            : 'text-apple-gray-700 dark:text-apple-gray-300 hover:text-apple-blue'
                                    }`}
                                >
                                    <span className="text-xl">{language.flag}</span>
                                    <div className="flex-1">
                                        <div className="font-medium">{language.nativeName}</div>
                                        <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                                            {language.name}
                                        </div>
                                    </div>
                                    {i18n.language === language.code && (
                                        <Check size={16} className="text-apple-blue" />
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* Small accent line at bottom */}
                        <div className="h-1 bg-gradient-to-r from-apple-blue/20 to-apple-blue/40"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
