/**
 * UploadDropZone Component
 * Drag and drop file upload area
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface UploadDropZoneProps {
    onFileUpload: (file: File) => void;
    disabled?: boolean;
}

export const UploadDropZone: React.FC<UploadDropZoneProps> = ({
    onFileUpload,
    disabled = false
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        const zipFile = files.find(file => file.name.toLowerCase().endsWith('.zip'));

        if (zipFile) {
            onFileUpload(zipFile);
        } else {
            alert('Please upload a ZIP file');
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            onFileUpload(file);
        } else {
            alert('Please select a ZIP file');
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBrowseClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div
            className={`upload-drop-zone ${isDragOver ? 'upload-drop-zone--drag-over' : ''} ${disabled ? 'upload-drop-zone--disabled' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInput}
                className="upload-drop-zone__input"
                disabled={disabled}
            />

            <div className="upload-drop-zone__content">
                <div className="upload-drop-zone__icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                </div>

                <div className="upload-drop-zone__text">
                    <h3>Drop your extension here</h3>
                    <p>Or <button
                        type="button"
                        className="upload-drop-zone__browse-btn"
                        onClick={handleBrowseClick}
                        disabled={disabled}
                    >
                        browse files
                    </button></p>
                    <small>Only ZIP files are supported</small>
                </div>
            </div>
        </div>
    );
};
