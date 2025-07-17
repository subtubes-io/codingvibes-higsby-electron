/**
 * ExtensionCard Component
 * Individual extension display card
 */

import React from 'react';
import { ExtensionActions } from './ExtensionActions';
import { ExtensionManifest } from '../../services/extensionService';

interface ExtensionCardProps {
    extension: ExtensionManifest;
    onToggle: () => void;
    onDelete: () => void;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({
    extension,
    onToggle,
    onDelete
}) => {
    const getStatusColor = () => {
        switch (extension.status) {
            case 'enabled':
                return 'status-enabled';
            case 'disabled':
                return 'status-disabled';
            case 'error':
                return 'status-error';
            default:
                return 'status-installed';
        }
    };

    const getStatusText = () => {
        switch (extension.status) {
            case 'enabled':
                return 'Enabled';
            case 'disabled':
                return 'Disabled';
            case 'error':
                return 'Error';
            default:
                return 'Installed';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className={`extension-card ${extension.status === 'enabled' ? 'extension-card--enabled' : ''}`}>
            <div className="extension-card__header">
                <div className="extension-card__icon">
                    {extension.icon ? (
                        <img
                            src={extension.icon}
                            alt={`${extension.name} icon`}
                            onError={(e) => {
                                // Fallback to default icon if image fails to load
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="extension-card__default-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="extension-card__info">
                    <h3 className="extension-card__name">{extension.name}</h3>
                    <p className="extension-card__version">v{extension.version}</p>
                </div>

                <div className={`extension-card__status ${getStatusColor()}`}>
                    {getStatusText()}
                </div>
            </div>

            <div className="extension-card__body">
                <p className="extension-card__description">
                    {extension.description}
                </p>

                <div className="extension-card__meta">
                    <div className="meta-item">
                        <span className="meta-label">Author:</span>
                        <span className="meta-value">{extension.author}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Installed:</span>
                        <span className="meta-value">{formatDate(extension.installedAt)}</span>
                    </div>
                    {extension.tags && extension.tags.length > 0 && (
                        <div className="meta-item">
                            <span className="meta-label">Tags:</span>
                            <div className="extension-card__tags">
                                {extension.tags.map((tag: string) => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {extension.errorMessage && (
                    <div className="extension-card__error">
                        <p>{extension.errorMessage}</p>
                    </div>
                )}
            </div>

            <div className="extension-card__footer">
                <ExtensionActions
                    extension={extension}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
};
