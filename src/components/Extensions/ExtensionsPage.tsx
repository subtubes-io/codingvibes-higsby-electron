/**
 * Extensions Page
 * Main page component that combines all extension features
 */

import React, { useState, useCallback } from 'react';
import { ExtensionUpload } from '../ExtensionUpload';
import { ExtensionManager } from '../ExtensionManager';
import { ExtensionLoader } from '../ExtensionLoader';
import { ExtensionUploadResult } from '../../types/extension';
import './ExtensionsPage.css';

type TabType = 'upload' | 'manage' | 'view';

export const ExtensionsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('manage');
    const [selectedExtensionId, setSelectedExtensionId] = useState<string | undefined>();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadComplete = useCallback((result: ExtensionUploadResult) => {
        if (result.success && result.extension) {
            // Switch to manage tab after successful upload
            setActiveTab('manage');
            // Force refresh of the manager
            setRefreshKey(prev => prev + 1);
        }
    }, []);

    const handleUploadError = useCallback((error: string) => {
        console.error('Upload error:', error);
        // Error handling is already done in the ExtensionUpload component
    }, []);

    const handleExtensionToggle = useCallback((extensionId: string, enabled: boolean) => {
        // Force refresh when extension is toggled
        setRefreshKey(prev => prev + 1);

        if (enabled && activeTab === 'view') {
            // If we're on the view tab and extension was enabled, select it
            setSelectedExtensionId(extensionId);
        }
    }, [activeTab]);

    const handleExtensionDelete = useCallback((extensionId: string) => {
        // Force refresh when extension is deleted
        setRefreshKey(prev => prev + 1);

        // If the deleted extension was selected in view, clear selection
        if (selectedExtensionId === extensionId) {
            setSelectedExtensionId(undefined);
        }
    }, [selectedExtensionId]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);

        // Clear selected extension when switching tabs
        if (tab !== 'view') {
            setSelectedExtensionId(undefined);
        }
    }, []);



    return (
        <div className="extensions-page">
            <div className="extensions-page__header">
                <div className="page-title">
                    <h1>Extensions</h1>
                    <p>Manage and use dynamic React component extensions</p>
                </div>
            </div>

            <div className="extensions-page__tabs">
                <button
                    className={`tab-btn ${activeTab === 'upload' ? 'tab-btn--active' : ''}`}
                    onClick={() => handleTabChange('upload')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    Upload Extension
                </button>

                <button
                    className={`tab-btn ${activeTab === 'manage' ? 'tab-btn--active' : ''}`}
                    onClick={() => handleTabChange('manage')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                    </svg>
                    Manage Extensions
                </button>

                <button
                    className={`tab-btn ${activeTab === 'view' ? 'tab-btn--active' : ''}`}
                    onClick={() => handleTabChange('view')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                    View Extensions
                </button>
            </div>

            <div className="extensions-page__content">
                {activeTab === 'upload' && (
                    <div className="tab-content tab-content--upload">
                        <ExtensionUpload
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                        />
                    </div>
                )}

                {activeTab === 'manage' && (
                    <div className="tab-content tab-content--manage">
                        <ExtensionManager
                            key={refreshKey} // Force re-render when refreshKey changes
                            onExtensionToggle={handleExtensionToggle}
                            onExtensionDelete={handleExtensionDelete}
                        />

                        <div className="manage-footer">
                            <p className="help-text">
                                <strong>Pro tip:</strong> Enable extensions to make them available in the View tab.
                                You can also click on an extension card to view it directly.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'view' && (
                    <div className="tab-content tab-content--view">
                        <ExtensionLoader
                            key={refreshKey} // Force re-render when refreshKey changes
                            selectedExtensionId={selectedExtensionId}
                            onExtensionChange={(extension) => {
                                setSelectedExtensionId(extension?.id);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
