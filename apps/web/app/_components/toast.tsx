'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
// useContext is kept for useToast hook below

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    description?: string;
    duration?: number;
    onClose?: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id'>) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const newToast: Toast = {
                ...toast,
                id,
                duration: toast.duration ?? 5000,
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-remove after duration
            if (newToast.duration && newToast.duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, newToast.duration);
            }

            return id;
        },
        [removeToast]
    );

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
export function ToastContainer({
    position = 'top-right',
}: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center' | 'bottom-center';
} = {}) {
    const { toasts, removeToast } = useToast();

    const positionClass = {
        'top-right': 'toast-top-right',
        'top-left': 'toast-top-left',
        'bottom-right': 'toast-bottom-right',
        'bottom-left': 'toast-bottom-left',
        'center': 'toast-center',
        'bottom-center': 'toast-bottom-center',
    }[position];

    return (
        <div className={`toast-container ${positionClass}`}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

/**
 * Toast Item Component
 * Individual toast notification
 */
function ToastItem({
    toast,
    onClose,
}: {
    toast: Toast;
    onClose: () => void;
}) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 200);
        toast.onClose?.();
    };

    const toastIcon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    }[toast.type];

    return (
        <div className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}>
            <div className="toast-icon">{toastIcon}</div>

            <div className="toast-content">
                {toast.title && <h4 className="toast-title">{toast.title}</h4>}
                <p className="toast-message">{toast.message}</p>
                {toast.description && <p className="toast-description">{toast.description}</p>}
            </div>

            <div className="toast-actions">
                {toast.action && (
                    <button className="toast-action" onClick={toast.action.onClick}>
                        {toast.action.label}
                    </button>
                )}
                <button
                    className="toast-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ✕
                </button>
            </div>

            {toast.duration && (
                <div
                    className="toast-progress"
                    style={{
                        animationDuration: `${toast.duration}ms`,
                    }}
                />
            )}
        </div>
    );
}

