// src/layouts/MainLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SubscriptionBanner from '../Dashboard/SubscriptionBanner'; 
import SubscriptionLockOverlay from '../Dashboard/SubscriptionLockOverlay';
import UpgradeModal from '../Dashboard/UpgradeModal'; // <-- 1. IMPORT MODAL

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true); 
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false); // <-- 2. ADD MODAL STATE

    return (
        // Added 'relative' here for the overlay
        <div className="relative flex h-screen bg-apple-gray-100 dark:bg-apple-gray-950 text-apple-gray-800 dark:text-apple-gray-200">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

                {/* --- 3. PASS THE 'onClick' HANDLER --- */}
                <SubscriptionBanner onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-black p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto "> 
                        <Outlet />
                    </div>
                </main>
            </div>
            
            {/* --- 3. PASS THE 'onClick' HANDLER --- */}
            <SubscriptionLockOverlay onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
            
            {/* --- 4. RENDER THE MODAL --- */}
            <UpgradeModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => setIsUpgradeModalOpen(false)} 
            />
        </div>
    );
};

export default MainLayout;