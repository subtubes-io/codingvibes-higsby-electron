/**
 * UploadProgress Component
 * Shows upload progress and status
 */

import React from 'react';
import { UploadProgress as UploadProgressType } from '../../types/extension';

interface UploadProgressProps {
    progress: UploadProgressType;
    onDismiss?: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
    progress,
    onDismiss
}) => {
    const getStatusText = () => {
        switch (progress.status) {
            case 'uploading':
                return 'Uploading...';
            case 'extracting':
                return 'Extracting files...';
            case 'validating':
                return 'Validating extension...';
            case 'installing':
                return 'Installing extension...';
            case 'complete':
                return 'Installation complete!';
            case 'error':
                return 'Installation failed';
            default:
                return 'Processing...';
        }
    };

    const getStatusIcon = () => {
        switch (progress.status) {
            case 'complete':
                return (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                );
            default:
                return (
                    <div className="upload-progress__spinner">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className={`upload-progress upload-progress--${progress.status}`}>
            <div className="upload-progress__header">
                <div className="upload-progress__icon">
                    {getStatusIcon()}
                </div>
                <div className="upload-progress__info">
                    <h3 className="upload-progress__status">{getStatusText()}</h3>
                    <p className="upload-progress__filename">{progress.fileName}</p>
                </div>
                {(progress.status === 'complete' || progress.status === 'error') && onDismiss && (
                    <button
                        className="upload-progress__dismiss"
                        onClick={onDismiss}
                        type="button"
                        aria-label="Dismiss"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="upload-progress__bar-container">
                <div
                    className="upload-progress__bar"
                    style={{ width: `${progress.progress}%` }}
                />
            </div>

            {progress.error && (
                <div className="upload-progress__error">
                    <p>{progress.error}</p>
                </div>
            )}

            {progress.status === 'complete' && (
                <div className="upload-progress__success">
                    <p>Extension installed successfully! Enable it in the Extensions Manager to start using it.</p>
                </div>
            )}
        </div>
    );
};
