'use client';

import React from 'react';

/**
 * Base Skeleton Component
 * A reusable loading placeholder with animation
 */
export function Skeleton({
  className = '',
  variant = 'pulse',
  ...props
}: {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'bounce';
} & React.HTMLAttributes<HTMLDivElement>) {
  const variantClass = {
    pulse: 'skeleton-pulse',
    shimmer: 'skeleton-shimmer',
    bounce: 'skeleton-bounce',
  }[variant];

  return (
    <div
      className={`skeleton ${variantClass} ${className}`}
      {...props}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText Component
 * Multiple text lines for content placeholders
 */
export function SkeletonText({
  lines = 3,
  className = '',
  variant = 'pulse',
}: {
  lines?: number;
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={`skeleton-line ${
            i === lines - 1 ? 'skeleton-line-short' : 'skeleton-line-long'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar Component
 * Circular skeleton for avatar placeholders
 */
export function SkeletonAvatar({
  size = 'md',
  className = '',
  variant = 'pulse',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  const sizeClass = size ? `skeleton-${size}` : '';

  return (
    <Skeleton
      variant={variant}
      className={`skeleton-circle ${sizeClass} ${className}`}
    />
  );
}

/**
 * SkeletonImage Component
 * Rectangular skeleton for image placeholders
 */
export function SkeletonImage({
  size = 'md',
  className = '',
  variant = 'pulse',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  const sizeClass = size ? `skeleton-${size}` : '';

  return (
    <Skeleton
      variant={variant}
      className={`skeleton-rect ${sizeClass} ${className}`}
    />
  );
}

/**
 * SkeletonCard Component
 * Complete card skeleton with header, body, and footer
 */
export function SkeletonCard({
  showFooter = true,
  variant = 'pulse',
}: {
  showFooter?: boolean;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <SkeletonAvatar variant={variant} />
        <div className="skeleton-content" style={{ flex: 1 }}>
          <Skeleton variant={variant} className="skeleton-title" />
          <Skeleton variant={variant} className="skeleton-subtitle" />
        </div>
      </div>

      <div className="skeleton-body">
        <Skeleton variant={variant} className="skeleton-line" />
        <Skeleton variant={variant} className="skeleton-line" />
        <Skeleton variant={variant} className="skeleton-line" />
      </div>

      {showFooter && (
        <div className="skeleton-footer">
          <Skeleton variant={variant} className="skeleton-button" />
          <Skeleton variant={variant} className="skeleton-button" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonListItem Component
 * Single list item skeleton
 */
export function SkeletonListItem({
  variant = 'pulse',
}: {
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <div className="skeleton-list-item">
      <SkeletonAvatar variant={variant} size="md" />
      <div className="skeleton-content" style={{ flex: 1 }}>
        <Skeleton variant={variant} className="skeleton-title" />
        <Skeleton variant={variant} className="skeleton-subtitle" />
      </div>
      <Skeleton variant={variant} className="skeleton-value" />
    </div>
  );
}

/**
 * SkeletonList Component
 * Multiple list items
 */
export function SkeletonList({
  count = 5,
  variant = 'pulse',
}: {
  count?: number;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} variant={variant} />
      ))}
    </div>
  );
}

/**
 * SkeletonGrid Component
 * Grid of card skeletons
 */
export function SkeletonGrid({
  count = 6,
  variant = 'pulse',
}: {
  count?: number;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

/**
 * SkeletonTable Component
 * Table layout skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 3,
  variant = 'pulse',
}: {
  rows?: number;
  columns?: number;
  variant?: 'pulse' | 'shimmer' | 'bounce';
}) {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i}>
              <Skeleton variant={variant} className="skeleton-line" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx}>
                <Skeleton
                  variant={variant}
                  className="skeleton-line"
                  style={{
                    width: `${90 - colIdx * 10}%`,
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * SkeletonWrapper Component
 * Wrapper that toggles between skeleton and content
 */
export function SkeletonWrapper({
  isLoading,
  skeleton,
  children,
}: {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`skeleton-wrapper ${isLoading ? 'is-loading' : ''}`}>
      <div className="skeleton">{skeleton}</div>
      {children}
    </div>
  );
}
