// client/src/App.js
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PixelTracker from "./components/PixelTracker";
import { DirectoryAuthProvider } from './contexts/DirectoryAuthContext';

// --- LAYOUTS ---
import DirectoryLayout from './pages/Public/DirectoryLayout';
import Spinner from './components/UI/Spinner';

// --- ROUTE PROTECTION ---
import DirectoryAdminRoute from './components/Auth/DirectoryAdminRoute';

// --- LAZY-LOADED PAGE COMPONENTS ---
const DirectoryAdminLoginPage = lazy(() => import('./pages/Admin/DirectoryAdminLoginPage'));
const DirectoryAdminDashboard = lazy(() => import('./pages/Admin/DirectoryAdminDashboard'));
const DirectoryPage = lazy(() => import('./pages/Public/DirectoryPage'));
const BusinessProfilePage = lazy(() => import('./pages/Public/BusinessProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
// --- ROUTE PROTECTION COMPONENTS ---


function App() {
    return (
        <Router>
                <PixelTracker />
            <DirectoryAuthProvider>
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
                    <Routes>
                      
                         <Route path="/" element={<Navigate to="/directory" replace />} />
                        {/* --- 2. PUBLIC DIRECTORY ROUTES --- */}
                        <Route element={<DirectoryLayout />}>
                            <Route path="/directory" element={<DirectoryPage />} />
                            <Route path="/directory/:slug" element={<BusinessProfilePage />} />
                        </Route>
                        
                        <Route path="/directory-admin/login" element={<DirectoryAdminLoginPage />} />

                        {/* --- 4. PROTECTED MAIN APPLICATION --- */}
                        

                        {/* --- 5. HIDDEN DIRECTORY ADMIN DASHBOARD --- */}
                        <Route element={<DirectoryAdminRoute />}>
                            <Route path="/directory-admin/dashboard" element={<DirectoryAdminDashboard />} />
                        </Route>

                        {/* --- 6. CATCH-ALL NOT FOUND --- */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </DirectoryAuthProvider>
        </Router>
    );
}

export default App;