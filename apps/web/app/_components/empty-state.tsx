'use client';

import React, { ReactNode } from 'react';

type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'success' | 'offline';
type EmptyStateSize = 'sm' | 'md' | 'lg';
type IconColor = 'primary' | 'success' | 'danger' | 'warning';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
    variant?: EmptyStateVariant;
    size?: EmptyStateSize;
    className?: string;
}

/**
 * EmptyState Component
 * Displays a message when there's no data/content to show
 */
export function EmptyState({
    icon,
    title,
    description,
    actions,
    variant = 'no-data',
    size = 'md',
    className = '',
}: EmptyStateProps) {
    const variantClass = `empty-state-${variant}`;
    const sizeClass = size !== 'md' ? `empty-state-${size}` : '';

    const defaultIcon = {
        'no-data': '📭',
        'no-results': '🔍',
        'error': '⚠️',
        'success': '✅',
        'offline': '🌐',
    }[variant];

    return (
        <div className={`empty-state ${variantClass} ${sizeClass} ${className}`}>
            {icon && <div className="empty-state-icon">{icon}</div>}
            {!icon && <div className="empty-state-icon">{defaultIcon}</div>}

            <div className="empty-state-content">
                <h3 className="empty-state-title">{title}</h3>
                {description && <p className="empty-state-description">{description}</p>}
            </div>

            {actions && <div className="empty-state-actions">{actions}</div>}
        </div>
    );
}

/**
 * NoDataState Component
 * When there's no data to display
 */
export function NoDataState({
    title = 'No data yet',
    description = 'Start by adding your first item',
    action,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <EmptyState
            icon="📭"
            title={title}
            description={description}
            variant="no-data"
            actions={action}
        />
    );
}

/**
 * NoResultsState Component
 * When a search returns no results
 */
export function NoResultsState({
    title = 'No results found',
    description = 'Try adjusting your search or filters',
    action,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <EmptyState
            icon="🔍"
            title={title}
            description={description}
            variant="no-results"
            actions={action}
        />
    );
}

/**
 * ErrorState Component
 * When something went wrong
 */
export function ErrorState({
    title = 'Something went wrong',
    description = 'We encountered an error. Please try again.',
    action,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <EmptyState
            icon="⚠️"
            title={title}
            description={description}
            variant="error"
            actions={action}
        />
    );
}

/**
 * SuccessState Component
 * When an action completes successfully
 */
export function SuccessState({
    title = 'Success!',
    description = 'Your action has been completed.',
    action,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <EmptyState
            icon="✅"
            title={title}
            description={description}
            variant="success"
            actions={action}
        />
    );
}

/**
 * OfflineState Component
 * When the device is offline
 */
export function OfflineState({
    title = 'You are offline',
    description = 'Check your connection and try again',
    action,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <EmptyState
            icon="🌐"
            title={title}
            description={description}
            variant="offline"
            actions={action}
        />
    );
}

/**
 * CustomEmptyState Component
 * For complete customization
 */
export function CustomEmptyState({
    icon,
    title,
    description,
    actions,
    illustration,
    size = 'md',
    className = '',
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
    illustration?: string;
    size?: EmptyStateSize;
    className?: string;
}) {
    return (
        <div className={`empty-state empty-state-${size} ${className}`}>
            {illustration && (
                <img src={illustration} alt="" className="empty-state-illustration" />
            )}
            {icon && <div className="empty-state-icon">{icon}</div>}

            <div className="empty-state-content">
                <h3 className="empty-state-title">{title}</h3>
                {description && <p className="empty-state-description">{description}</p>}
            </div>

            {actions && <div className="empty-state-actions">{actions}</div>}
        </div>
    );
}
