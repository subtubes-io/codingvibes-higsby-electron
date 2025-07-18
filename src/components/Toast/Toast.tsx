import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastMessage {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastProps {
    message: ToastMessage;
    onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const duration = message.duration || 5000;
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onRemove(message.id), 300); // Allow fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [message.id, message.duration, onRemove]);

    const handleRemove = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(message.id), 300);
    };

    const getToastClass = () => {
        const baseClass = 'toast';
        const typeClass = message.type ? `toast-${message.type}` : 'toast-info';
        const visibilityClass = isVisible ? 'toast-visible' : 'toast-hidden';
        return `${baseClass} ${typeClass} ${visibilityClass}`;
    };

    return (
        <div className={getToastClass()}>
            <div className="toast-content">
                <span className="toast-message">{message.message}</span>
                <button
                    className="toast-close"
                    onClick={handleRemove}
                    aria-label="Close notification"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;
