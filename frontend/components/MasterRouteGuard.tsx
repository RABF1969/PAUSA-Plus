
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const MasterRouteGuard: React.FC = () => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem('alfabiz_master_token');
        setIsAuthenticated(!!token);
    }, [location]);

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>; // Loading state to prevent flash
    }

    if (!isAuthenticated) {
        return <Navigate to="/alfabiz/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default MasterRouteGuard;
