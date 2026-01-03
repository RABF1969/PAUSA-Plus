
import React from 'react';

interface MasterLayoutProps {
    children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
            {/* Force text alignment and color reset to avoid global overrides */}
            <div className="w-full text-slate-900">
                {children}
            </div>
        </div>
    );
};

export default MasterLayout;
