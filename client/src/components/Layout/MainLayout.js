// src/layouts/MainLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// --- THIS IS THE FIX ---
// The import paths now correctly point to the 'components' folder.
import SubscriptionBanner from '../Dashboard/SubscriptionBanner'; 
import SubscriptionLockOverlay from '../Dashboard/SubscriptionLockOverlay';
import UpgradeModal from '../Dashboard/UpgradeModal';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true); 
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    return (
        <div className="relative flex h-screen bg-apple-gray-100 dark:bg-apple-gray-950 text-apple-gray-800 dark:text-apple-gray-200">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

                {/* This now correctly passes the function to open the modal */}
                <SubscriptionBanner onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-black p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto "> 
                        <Outlet />
                    </div>
                </main>
            </div>
            
            {/* This now correctly passes the function to open the modal */}
            <SubscriptionLockOverlay onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
            
            {/* This now renders the modal, which is controlled by this layout */}
            <UpgradeModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => setIsUpgradeModalOpen(false)} 
            />
        </div>
    );
};

export default MainLayout;