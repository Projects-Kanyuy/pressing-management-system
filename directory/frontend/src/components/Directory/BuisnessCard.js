// src/components/Directory/BusinessCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

const BusinessCard = ({ business }) => {
    // Fallback images if none are provided
    const bannerUrl = business.bannerUrl || 'https://via.placeholder.com/400x200/1a1a1a/ffffff?text=No+Banner';
    const logoUrl = business.logoUrl || 'https://via.placeholder.com/150/ffffff/1a1a1a?text=No+Logo';

    const handleWhatsAppContact = (e) => {
        e.preventDefault(); // Prevent navigation if the card itself is a link
        if (!business.publicPhone) return;
        const phoneNumber = business.publicPhone.replace(/\s/g, '').replace('+', '');
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="bg-white dark:bg-apple-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1">
            {/* Banner Image */}
            <div className="h-32 md:h-40 bg-cover bg-center" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
            
            {/* Logo and Name Section */}
            <div className="p-6">
                <div className="flex items-center -mt-16">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-apple-gray-800 overflow-hidden flex-shrink-0">
                        <img src={logoUrl} alt={`${business.name} logo`} className="w-full h-full object-cover" />
                    </div>
                </div>

                <h3 className="text-xl font-bold mt-4 text-apple-gray-900 dark:text-white truncate">{business.name}</h3>
                <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1 h-10 overflow-hidden">
                    {business.description}
                </p>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link to={`/directory/${business.slug}`} className="flex-1">
                        <button className="w-full px-4 py-2 text-sm font-semibold text-apple-gray-700 dark:text-apple-gray-200 bg-apple-gray-100 dark:bg-apple-gray-700 rounded-lg hover:bg-apple-gray-200 dark:hover:bg-apple-gray-600">
                            View Details
                        </button>
                    </Link>
                    <button 
                        onClick={handleWhatsAppContact} 
                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                        disabled={!business.publicPhone}
                    >
                        <Phone size={16} /> Contact via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessCard;