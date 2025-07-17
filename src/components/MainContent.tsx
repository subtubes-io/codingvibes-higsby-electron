import React from 'react';
import DemoPage from './DemoPage';
import './MainContent.css';

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
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Dashboard</h2>
                            <p>Welcome to your dashboard overview</p>
                        </div>
                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Total Projects</h3>
                                <div className="metric">12</div>
                            </div>
                            <div className="dashboard-card">
                                <h3>Active Tasks</h3>
                                <div className="metric">34</div>
                            </div>
                            <div className="dashboard-card">
                                <h3>Team Members</h3>
                                <div className="metric">8</div>
                            </div>
                            <div className="dashboard-card">
                                <h3>Completed</h3>
                                <div className="metric">156</div>
                            </div>
                        </div>
                    </div>
                );

            case 'demo':
                return (
                    <div className="content-section">
                        <DemoPage />
                    </div>
                );

            case 'projects':
                return (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Projects</h2>
                            <p>Manage your projects and workflows</p>
                        </div>
                        <div className="project-list">
                            <div className="project-card">
                                <h4>CDV Electron App</h4>
                                <p>Desktop application built with Electron, React, and TypeScript</p>
                                <div className="project-status active">Active</div>
                            </div>
                            <div className="project-card">
                                <h4>Web Dashboard</h4>
                                <p>Modern web dashboard with analytics and reporting</p>
                                <div className="project-status planning">Planning</div>
                            </div>
                            <div className="project-card">
                                <h4>Mobile App</h4>
                                <p>Cross-platform mobile application</p>
                                <div className="project-status completed">Completed</div>
                            </div>
                        </div>
                    </div>
                );

            case 'tasks':
                return (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Tasks</h2>
                            <p>Track and manage your tasks</p>
                        </div>
                        <div className="task-list">
                            <div className="task-item">
                                <div className="task-checkbox">
                                    <input type="checkbox" />
                                </div>
                                <div className="task-content">
                                    <h4>Implement sidebar navigation</h4>
                                    <p>Create collapsible sidebar with menu items</p>
                                </div>
                                <div className="task-priority high">High</div>
                            </div>
                            <div className="task-item">
                                <div className="task-checkbox">
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="task-content">
                                    <h4>Setup Electron app</h4>
                                    <p>Initialize Electron with Vite and React</p>
                                </div>
                                <div className="task-priority completed">Done</div>
                            </div>
                        </div>
                    </div>
                );

            case 'analytics':
                return (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Analytics</h2>
                            <p>View your performance metrics and insights</p>
                        </div>
                        <div className="analytics-content">
                            <div className="chart-placeholder">
                                <h3>Performance Chart</h3>
                                <p>Chart visualization would go here</p>
                            </div>
                        </div>
                    </div>
                );

            case 'team':
                return (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Team</h2>
                            <p>Manage your team members and permissions</p>
                        </div>
                        <div className="team-grid">
                            <div className="team-member">
                                <div className="avatar">JD</div>
                                <h4>John Doe</h4>
                                <p>Frontend Developer</p>
                            </div>
                            <div className="team-member">
                                <div className="avatar">JS</div>
                                <h4>Jane Smith</h4>
                                <p>UI/UX Designer</p>
                            </div>
                            <div className="team-member">
                                <div className="avatar">MB</div>
                                <h4>Mike Brown</h4>
                                <p>Backend Developer</p>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Settings</h2>
                            <p>Configure your application preferences</p>
                        </div>
                        <div className="settings-form">
                            <div className="setting-group">
                                <label>Theme</label>
                                <select>
                                    <option>Dark</option>
                                    <option>Light</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div className="setting-group">
                                <label>Language</label>
                                <select>
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div className="setting-group">
                                <label>
                                    <input type="checkbox" />
                                    Enable notifications
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return children || (
                    <div className="content-section">
                        <div className="page-header">
                            <h2>Welcome</h2>
                            <p>Select a menu item to get started</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="content-container">
                {renderContent()}
            </div>
        </main>
    );
};

export default MainContent;
