// client/src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    PlusCircle,
    Users,      // Using Users icon for "Customers" link
    Settings,   // For Admin settings
    Package,    // For Logo
    CreditCard, // This was for a placeholder "Payments" link, remove if not used
    X,
    KeyRound,
    Tags,
    Inbox          // For closing sidebar on mobile
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // To conditionally show Admin section
import Button from '../UI/Button';

// NavItem component (assuming this is already correct and handles active/disabled states)
const NavItem = ({ to, icon: Icon, children, end = false, disabled = false }) => (
    <NavLink
        to={to}
        end={end}
        onClick={(e) => disabled && e.preventDefault()} // Prevent navigation if disabled
        className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-apple text-sm font-medium 
            transition-colors duration-150 ease-apple
            ${disabled
                ? 'text-apple-gray-400 dark:text-apple-gray-600 cursor-not-allowed opacity-50' // Added opacity for disabled
                : isActive
                    ? 'bg-apple-blue text-white shadow-apple-sm'
                    : 'text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700/60'
            }`
        }
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
    >
        <Icon size={18} className="flex-shrink-0" />
        <span>{children}</span>
    </NavLink>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Get user to check for admin role

    return (
        <>
            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40 flex flex-col
                    w-64 bg-apple-gray-50 dark:bg-apple-gray-900
                    border-r border-apple-gray-200 dark:border-apple-gray-800
                    transform transition-transform duration-300 ease-apple
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                    flex-shrink-0
                `}
                aria-label="Main sidebar"
            >
                <div className="flex items-center justify-between h-[60px] px-4 border-b border-apple-gray-200 dark:border-apple-gray-800">
                    <Link to="/" className="flex items-center space-x-2" onClick={() => isOpen && setIsOpen(false)}>
                        <Package size={24} className="text-apple-blue" />
                        <span className="text-xl font-bold text-apple-gray-800 dark:text-apple-gray-100">
                            Press<span className="text-apple-blue">Flow</span>
                        </span>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-1 lg:hidden" aria-label={t('sidebar.closeSidebar')}>
                        <X size={20} />
                    </Button>
                </div>

                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar if you defined it */}
                     <NavItem to="dashboard" icon={LayoutDashboard} end={true}>{t('sidebar.navigation.dashboard')}</NavItem>
                    <NavItem to="/app/orders/new" icon={PlusCircle}>{t('sidebar.navigation.newOrder')}</NavItem>

                    {/* MODIFIED: "Manage Users" is now "Customers" and points to /customers */}
                    <NavItem to="/app/customers" icon={Users}>{t('sidebar.navigation.customers')}</NavItem>
                    <NavItem to="/app/payments" icon={CreditCard}>{t('sidebar.navigation.payments')}</NavItem>
                    <NavItem to="/app/inbox" icon={Inbox}>{t('sidebar.navigation.inbox')}</NavItem>
                    {/* If you still wanted a placeholder for Payments, it would go here */}
                    {/* <NavItem to="/payments" icon={CreditCard} disabled={true}>Payments (Soon)</NavItem> */}


                    {/* Admin-specific section */}
                    {user?.role === 'admin' && (
                        <>
                            <div className="pt-4 pb-1 px-3"> {/* Added more top padding */}
                                <span className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">{t('sidebar.admin.title')}</span>
                            </div>
                            <NavItem to="/app/admin/settings" icon={Settings}>{t('sidebar.admin.settings')}</NavItem>
                            <NavItem to="/app/admin/users" icon={KeyRound}>{t('sidebar.admin.manageStaff')}</NavItem>
                            <NavItem to="/app/admin/pricing" icon={Tags}>{t('sidebar.admin.servicesPricing')}</NavItem>
                            {/*<NavItem to="/app/admin/manage-users" icon={Users}>Manage Users</NavItem> */}
                            {/* <NavItem to="/admin-guide/user-management" icon={UsersCog} disabled={true}>Manage Logins (Guide)</NavItem> */}
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-apple-gray-200 dark:border-apple-gray-800">
                    <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 text-center">
                        © {new Date().getFullYear()} PressFlow
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;