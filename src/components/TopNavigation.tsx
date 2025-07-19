import React from 'react';
import higsbyLogo from '../assets/higsby-logo.svg';

interface TopNavigationProps {
    onToggleSidebar?: () => void;
    title?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
    // onToggleSidebar,
    title = "Higsby"
}) => {
    return (
        <nav className="fixed top-0 left-0 right-0 h-15 bg-gradient-to-br from-primary-500 to-primary-600 border-b border-white/10 flex items-center justify-between px-5 z-50 backdrop-blur-sm webkit-app-region-drag">
            <div className="flex items-center gap-4">
                <img
                    src={higsbyLogo}
                    alt="Higsby Logo"
                    className="w-8 h-8 webkit-app-region-no-drag"
                />
                <h1 className="text-white text-xl font-semibold m-0 tracking-wider">{title}</h1>
            </div>

            <div className="flex-1 flex justify-center">
                {/* Search or additional controls can go here */}
            </div>

            <div className="flex items-center gap-2.5">
                <button
                    className="webkit-app-region-no-drag bg-transparent border-none text-white cursor-pointer p-2 rounded-md flex items-center justify-center transition-colors duration-200 hover:bg-white/10"
                    title="Settings"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="m12 1 1.2 2.2L16 2l.8 1.6 2.2-1.2v2.4l2.2 1.2L20 8l1.6.8L20 11.2V16l-1.6.8L20 19.2l-2.2 1.2L16 22l-.8-1.6L12 23l-1.2-2.2L8 22l-.8-1.6L5 21.2V16l-2.2-1.2L4 12l-1.6-.8L4 8.8V4l2.2-1.2L8 2l.8 1.6z"></path>
                    </svg>
                </button>
                <button
                    className="webkit-app-region-no-drag bg-transparent border-none text-white cursor-pointer p-2 rounded-md flex items-center justify-center transition-colors duration-200 hover:bg-white/10"
                    title="User Profile"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default TopNavigation;
