/**
 * ExtensionActions Component
 * Action buttons for extensions (enable/disable/delete)
 */

import React, { useState } from 'react';
import { ExtensionManifest } from '../../services/extensionService';

interface ExtensionActionsProps {
    extension: ExtensionManifest;
    onToggle: () => void;
    onDelete: () => void;
}

export const ExtensionActions: React.FC<ExtensionActionsProps> = ({
    extension,
    onToggle,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            await onToggle();
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete();
        } finally {
            setIsDeleting(false);
        }
    };

    const isLoading = isToggling;
    const hasError = extension.status === 'error';
    const isEnabled = extension.status === 'enabled';

    return (
        <div className="extension-actions">
            <button
                className={`action-btn toggle-btn ${isEnabled ? 'toggle-btn--enabled' : 'toggle-btn--disabled'}`}
                onClick={handleToggle}
                disabled={isLoading || isDeleting}
                title={isEnabled ? 'Disable extension' : 'Enable extension'}
            >
                {isLoading ? (
                    <div className="btn-spinner">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            {isEnabled ? (
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M10,17L15,12L10,7V17Z" />
                            ) : (
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M14,17V7L9,12L14,17Z" />
                            )}
                        </svg>
                        {isEnabled ? 'Disable' : 'Enable'}
                    </>
                )}
            </button>

            {hasError && (
                <button
                    className="action-btn retry-btn"
                    onClick={handleToggle}
                    disabled={isLoading || isDeleting}
                    title="Retry loading extension"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                    </svg>
                    Retry
                </button>
            )}

            <button
                className="action-btn delete-btn"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                title="Delete extension"
            >
                {isDeleting ? (
                    <div className="btn-spinner">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                        Delete
                    </>
                )}
            </button>
        </div>
    );
};
