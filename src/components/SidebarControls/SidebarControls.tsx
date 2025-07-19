import React from 'react';
import { useSnapshot } from 'valtio';
import { sidebarStore, sidebarActions } from '../../stores/sidebarStore';
import './SidebarControls.css';

const SidebarControls: React.FC = () => {
    const sidebars = useSnapshot(sidebarStore);
    const anyOpen = sidebarActions.isAnySidebarOpen();

    return (
        <div className="sidebar-controls">
            <button
                className={`sidebar-control-btn ${anyOpen ? 'close-all' : 'open-all'}`}
                onClick={() => anyOpen ? sidebarActions.closeAll() : sidebarActions.openAll()}
                title={anyOpen ? 'Close All Sidebars' : 'Open All Sidebars'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {anyOpen ? (
                        // Close icon
                        <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                        // Menu/Open icon
                        <>
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </>
                    )}
                </svg>
                <span className="control-text">
                    {anyOpen ? 'Close All' : 'Show Panels'}
                </span>
            </button>

            {/* Individual controls */}
            <div className="individual-controls">
                <button
                    className={`sidebar-control-btn small ${sidebars.plugins ? 'active' : ''}`}
                    onClick={() => sidebarActions.toggleSidebar('plugins')}
                    title="Toggle Plugins"
                >
                    P
                </button>
                <button
                    className={`sidebar-control-btn small ${sidebars.graphs ? 'active' : ''}`}
                    onClick={() => sidebarActions.toggleSidebar('graphs')}
                    title="Toggle Graphs"
                >
                    G
                </button>
                <button
                    className={`sidebar-control-btn small ${sidebars.main ? 'active' : ''}`}
                    onClick={() => sidebarActions.toggleSidebar('main')}
                    title="Toggle Main Sidebar"
                >
                    M
                </button>
            </div>
        </div>
    );
};

export default SidebarControls;
