import React from 'react';
import '../../../styles/Badge.css';

export type BadgeVariant = 
  | 'primary'   // Main brand color (green)
  | 'secondary' // Secondary UI element (dark gray)
  | 'success'   // Positive status
  | 'warning'   // Caution status
  | 'danger'    // Negative/error status
  | 'info'      // Informational status
  | 'outline'   // Outlined style
  | 'count';    // For numeric indicators

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
}) => {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    rounded ? 'badge-rounded' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default Badge; 
