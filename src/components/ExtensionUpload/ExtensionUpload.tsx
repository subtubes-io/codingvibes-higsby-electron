/**
 * ExtensionUpload Component
 * Main upload interface for extensions
 */

import React, { useState, useCallback } from 'react';
import { UploadDropZone } from './UploadDropZone';
import { UploadProgress } from './UploadProgress';
import { UploadProgress as UploadProgressType, ExtensionUploadResult } from '../../types/extension';
import { ExtensionService } from '../../services/extensionService';
import './ExtensionUpload.css';

// Create a singleton instance
const extensionService = new ExtensionService();

interface ExtensionUploadProps {
    onUploadComplete?: (result: ExtensionUploadResult) => void;
    onUploadError?: (error: string) => void;
}

export const ExtensionUpload: React.FC<ExtensionUploadProps> = ({
    onUploadComplete,
    onUploadError
}) => {
    const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        setUploadProgress({
            fileName: file.name,
            progress: 0,
            status: 'uploading'
        });

        try {
            // Update progress for uploading
            setUploadProgress(prev => prev ? { ...prev, progress: 25, status: 'uploading' } : null);

            // Upload extension using HTTP service
            const result = await extensionService.uploadExtension(file);

            if (result.success) {
                setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'complete' } : null);
                onUploadComplete?.(result);

                // Clear progress after delay
                setTimeout(() => {
                    setUploadProgress(null);
                    setIsUploading(false);
                }, 2000);
            } else {
                setUploadProgress(prev => prev ? {
                    ...prev,
                    progress: 0,
                    status: 'error',
                    error: result.error
                } : null);
                onUploadError?.(result.error || 'Upload failed');

                setTimeout(() => {
                    setUploadProgress(null);
                    setIsUploading(false);
                }, 3000);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setUploadProgress(prev => prev ? {
                ...prev,
                progress: 0,
                status: 'error',
                error: errorMessage
            } : null);
            onUploadError?.(errorMessage);

            setTimeout(() => {
                setUploadProgress(null);
                setIsUploading(false);
            }, 3000);
        }
    }, [onUploadComplete, onUploadError]);

    const handleDismiss = useCallback(() => {
        if (!isUploading) {
            setUploadProgress(null);
        }
    }, [isUploading]);

    return (
        <div className="extension-upload">
            <div className="extension-upload__header">
                <h2>Install Extension</h2>
                <p>Upload a zip file containing a React component extension</p>
            </div>

            <div className="extension-upload__content">
                {uploadProgress ? (
                    <UploadProgress
                        progress={uploadProgress}
                        onDismiss={handleDismiss}
                    />
                ) : (
                    <UploadDropZone
                        onFileUpload={handleFileUpload}
                        disabled={isUploading}
                    />
                )}
            </div>

            <div className="extension-upload__info">
                <h3>Extension Requirements:</h3>
                <ul>
                    <li>Must be a valid ZIP archive</li>
                    <li>Must contain a <code>manifest.json</code> file</li>
                    <li>Must contain the main component file specified in manifest</li>
                    <li>Maximum file size: 10MB per file</li>
                    <li>Supported formats: .js, .jsx, .ts, .tsx</li>
                </ul>
            </div>
        </div>
    );
};
