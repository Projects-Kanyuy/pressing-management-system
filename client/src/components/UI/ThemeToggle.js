// client/src/components/UI/ThemeToggle.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import Button from './Button';

const ThemeToggle = ({ 
    className = "",
    size = "sm", // "sm" | "md" | "lg"
    variant = "ghost" // "ghost" | "outline" | "secondary"
}) => {
    const { t } = useTranslation();
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply dark mode class to document and save to localStorage
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <Button 
            variant={variant} 
            size={size} 
            onClick={toggleDarkMode} 
            className={`p-1.5 ${className}`} 
            aria-label={t('navbar.toggleDarkMode')}
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
    );
};

export default ThemeToggle;
