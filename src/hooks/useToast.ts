import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/Toast/Toast';

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type?: 'success' | 'error' | 'info', duration?: number) => {
        const id = crypto.randomUUID();
        const newToast: ToastMessage = {
            id,
            message,
            type: type || 'info',
            duration: duration || 5000
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts
    };
};
