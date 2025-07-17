import React from 'react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

interface SidebarProps {
    isCollapsed: boolean;
    activeItem: string;
    onItemClick: (itemId: string) => void;
}

const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
        ),
    },
    {
        id: 'demo',
        label: 'Demo',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
        ),
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
        ),
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
        ),
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v18h18"></path>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
            </svg>
        ),
    },
    {
        id: 'team',
        label: 'Team',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        ),
    },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, activeItem, onItemClick }) => {
    return (
        <aside className={`fixed top-15 left-0 bottom-0 bg-gray-900 border-r border-gray-700 py-5 overflow-y-auto transition-all duration-300 z-40 ${isCollapsed ? 'w-18' : 'w-70'
            } md:block ${isCollapsed ? '' : 'md:w-70'}`}>
            <div>
                <div className="mb-8">
                    {!isCollapsed && (
                        <div className="flex items-center px-5 mb-6">
                            <div className="text-gray-400 mr-3">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                    <polyline points="2 17 12 22 22 17"></polyline>
                                    <polyline points="2 12 12 17 22 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-gray-400 font-semibold tracking-wider">CDV</span>
                        </div>
                    )}
                </div>

                <nav>
                    <ul className="list-none p-0 m-0">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    className={`w-full flex items-center px-5 py-3 text-gray-400 transition-all duration-200 cursor-pointer gap-3 text-sm relative group ${isCollapsed ? 'justify-center px-3' : ''
                                        } ${activeItem === item.id
                                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                            : 'hover:bg-gray-800 hover:text-white'
                                        }`}
                                    onClick={() => onItemClick(item.id)}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <span className="text-lg min-w-5 text-center">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-15 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                            {item.label}
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="mt-auto px-0">
                <button
                    className={`w-full flex items-center px-5 py-3 text-gray-400 transition-all duration-200 cursor-pointer gap-3 text-sm relative group hover:bg-gray-800 hover:text-white ${isCollapsed ? 'justify-center px-3' : ''
                        }`}
                    title={isCollapsed ? 'Help & Support' : ''}
                >
                    <span className="text-lg min-w-5 text-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                    </span>
                    {!isCollapsed && <span className="flex-1 text-left">Help & Support</span>}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                        <div className="absolute left-15 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Help & Support
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
