import React from 'react';
import Toast, { ToastMessage } from './Toast';
import './Toast.css';

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast}
                    onRemove={onRemoveToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
