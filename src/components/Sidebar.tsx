import React from 'react';
import { useSnapshot } from 'valtio';
import { sidebarStore } from '../stores/sidebarStore';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

interface SidebarProps {
    activeItem: string;
    onItemClick: (itemId: string) => void;
    title?: string;
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
        id: 'graph',
        label: 'Graph View',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        ),
    },
    {
        id: 'extensions',
        label: 'Extensions',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                <line x1="16" y1="8" x2="2" y2="22"></line>
                <line x1="17.5" y1="15" x2="9" y2="15"></line>
            </svg>
        ),
    }
    // {
    //     id: 'demo',
    //     label: 'Demo',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    //             <polyline points="2 17 12 22 22 17"></polyline>
    //             <polyline points="2 12 12 17 22 12"></polyline>
    //         </svg>
    //     ),
    // },
    // {
    //     id: 'projects',
    //     label: 'Projects',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    //             <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    //         </svg>
    //     ),
    // },
    // {
    //     id: 'tasks',
    //     label: 'Tasks',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <path d="M9 11l3 3L22 4"></path>
    //             <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    //         </svg>
    //     ),
    // },
    // {
    //     id: 'analytics',
    //     label: 'Analytics',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <path d="M3 3v18h18"></path>
    //             <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
    //         </svg>
    //     ),
    // },
    // {
    //     id: 'team',
    //     label: 'Team',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    //             <circle cx="9" cy="7" r="4"></circle>
    //             <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    //             <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    //         </svg>
    //     ),
    // },
    // {
    //     id: 'settings',
    //     label: 'Settings',
    //     icon: (
    //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //             <circle cx="12" cy="12" r="3"></circle>
    //             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    //         </svg>
    //     ),
    // },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, title = "Higsby" }) => {
    const sidebars = useSnapshot(sidebarStore);
    const isCollapsed = !sidebars.main;
    return (
        <aside className={`fixed top-15 left-0 bottom-0 bg-gray-900 border-r border-gray-700 py-5 overflow-y-auto transition-all duration-300 z-40 ${isCollapsed ? 'w-18' : 'w-70'
            } md:block ${isCollapsed ? '' : 'md:w-70'}`}>
            <div>
                <div className="mb-8">

                    <div className="flex items-center px-5 mb-6">

                        {!isCollapsed && (
                            <h1 className="text-white text-xl font-semibold m-0 tracking-wider">{title}</h1>
                            // <span className="text-gray-400 font-semibold tracking-wider flex items-center gap-1">
                            //     PNW
                            //     <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="mx-1">
                            //         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            //     </svg>
                            // </span>
                        )}
                    </div>

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
