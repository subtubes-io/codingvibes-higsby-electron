import React from 'react';
import './TopNavigation.css';

interface TopNavigationProps {
    onToggleSidebar: () => void;
    title?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
    onToggleSidebar,
    title = "CDV Electron"
}) => {
    return (
        <nav className="top-navigation">
            <div className="nav-left">
                <button
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <h1 className="app-title">{title}</h1>
            </div>

            <div className="nav-center">
                {/* Search or additional controls can go here */}
            </div>

            <div className="nav-right">
                <button className="nav-button" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="m12 1 1.2 2.2L16 2l.8 1.6 2.2-1.2v2.4l2.2 1.2L20 8l1.6.8L20 11.2V16l-1.6.8L20 19.2l-2.2 1.2L16 22l-.8-1.6L12 23l-1.2-2.2L8 22l-.8-1.6L5 21.2V16l-2.2-1.2L4 12l-1.6-.8L4 8.8V4l2.2-1.2L8 2l.8 1.6z"></path>
                    </svg>
                </button>
                <button className="nav-button" title="User Profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default TopNavigation;
