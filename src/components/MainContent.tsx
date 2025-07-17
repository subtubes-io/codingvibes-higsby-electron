import React from 'react';
import DemoPage from './DemoPage';
import { ExtensionsPage } from './Extensions';
import GraphView from './GraphView';

interface MainContentProps {
    isSidebarCollapsed: boolean;
    activeSection: string;
    children?: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({
    isSidebarCollapsed,
    activeSection,
    children
}) => {
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Dashboard</h2>
                            <p className="text-gray-600 text-lg m-0">Welcome to your dashboard overview</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl text-center">
                                <h3 className="m-0 mb-3 text-base font-medium opacity-90">Total Projects</h3>
                                <div className="text-4xl font-bold m-0">12</div>
                            </div>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl text-center">
                                <h3 className="m-0 mb-3 text-base font-medium opacity-90">Active Tasks</h3>
                                <div className="text-4xl font-bold m-0">34</div>
                            </div>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl text-center">
                                <h3 className="m-0 mb-3 text-base font-medium opacity-90">Team Members</h3>
                                <div className="text-4xl font-bold m-0">8</div>
                            </div>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl text-center">
                                <h3 className="m-0 mb-3 text-base font-medium opacity-90">Completed</h3>
                                <div className="text-4xl font-bold m-0">156</div>
                            </div>
                        </div>
                    </div>
                );

            case 'demo':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <DemoPage />
                    </div>
                );

            case 'projects':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Projects</h2>
                            <p className="text-gray-600 text-lg m-0">Manage your projects and workflows</p>
                        </div>
                        <div className="flex flex-col gap-4 mt-5">
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 relative">
                                <h4 className="m-0 mb-2 text-gray-900 text-xl">Higsby App</h4>
                                <p className="m-0 mb-3 text-gray-600 leading-relaxed">Desktop application built with Electron, React, and TypeScript</p>
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-green-200 text-green-800">Active</div>
                            </div>
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 relative">
                                <h4 className="m-0 mb-2 text-gray-900 text-xl">Web Dashboard</h4>
                                <p className="m-0 mb-3 text-gray-600 leading-relaxed">Modern web dashboard with analytics and reporting</p>
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-yellow-200 text-yellow-800">Planning</div>
                            </div>
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 relative">
                                <h4 className="m-0 mb-2 text-gray-900 text-xl">Mobile App</h4>
                                <p className="m-0 mb-3 text-gray-600 leading-relaxed">Cross-platform mobile application</p>
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-blue-200 text-blue-800">Completed</div>
                            </div>
                        </div>
                    </div>
                );

            case 'tasks':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Tasks</h2>
                            <p className="text-gray-600 text-lg m-0">Track and manage your tasks</p>
                        </div>
                        <div className="mt-5">
                            <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg mb-3 bg-gray-100">
                                <div>
                                    <input type="checkbox" className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="m-0 mb-1 text-gray-900">Implement sidebar navigation</h4>
                                    <p className="m-0 text-gray-600 text-sm">Create collapsible sidebar with menu items</p>
                                </div>
                                <div className="px-2 py-1 rounded text-xs font-semibold uppercase bg-red-200 text-red-800">High</div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg mb-3 bg-gray-100">
                                <div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="m-0 mb-1 text-gray-900">Setup Electron app</h4>
                                    <p className="m-0 text-gray-600 text-sm">Initialize Electron with Vite and React</p>
                                </div>
                                <div className="px-2 py-1 rounded text-xs font-semibold uppercase bg-green-200 text-green-800">Done</div>
                            </div>
                        </div>
                    </div>
                );

            case 'analytics':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Analytics</h2>
                            <p className="text-gray-600 text-lg m-0">View your performance metrics and insights</p>
                        </div>
                        <div className="mt-5">
                            <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg py-15 px-5 text-center text-gray-500">
                                <h3 className="m-0 mb-2">Performance Chart</h3>
                                <p className="m-0">Chart visualization would go here</p>
                            </div>
                        </div>
                    </div>
                );

            case 'team':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Team</h2>
                            <p className="text-gray-600 text-lg m-0">Manage your team members and permissions</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 text-center">
                                <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-3">JD</div>
                                <h4 className="m-0 mb-1 text-gray-900">John Doe</h4>
                                <p className="m-0 text-gray-600 text-sm">Frontend Developer</p>
                            </div>
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 text-center">
                                <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-3">JS</div>
                                <h4 className="m-0 mb-1 text-gray-900">Jane Smith</h4>
                                <p className="m-0 text-gray-600 text-sm">UI/UX Designer</p>
                            </div>
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 text-center">
                                <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-3">MB</div>
                                <h4 className="m-0 mb-1 text-gray-900">Mike Brown</h4>
                                <p className="m-0 text-gray-600 text-sm">Backend Developer</p>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Settings</h2>
                            <p className="text-gray-600 text-lg m-0">Configure your application preferences</p>
                        </div>
                        <div className="mt-5">
                            <div className="mb-5">
                                <label className="block mb-2 text-gray-700 font-medium">Theme</label>
                                <select className="w-full max-w-xs px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-700">
                                    <option>Dark</option>
                                    <option>Light</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 text-gray-700 font-medium">Language</label>
                                <select className="w-full max-w-xs px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-700">
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 text-gray-700 font-medium">
                                    <input type="checkbox" className="mr-2" />
                                    Enable notifications
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 'extensions':
                return <ExtensionsPage />;

            case 'graph':
                return <GraphView />;

            default:
                return children || (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Welcome</h2>
                            <p className="text-gray-600 text-lg m-0">Select a menu item to get started</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className={`mt-15 p-5 md:p-8 min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-70'
            }`}>
            <div className="max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </main>
    );
};

export default MainContent;
