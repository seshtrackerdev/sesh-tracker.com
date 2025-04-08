import React from 'react';
import '../../../styles/Card.css';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  elevated?: boolean;
  interactive?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

// Card Header Component
export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
export interface CardTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <h3 className={`card-title ${className}`}>
      {children}
    </h3>
  );
};

// Card Content Component
export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  elevated = false,
  interactive = false,
  bordered = true,
  className = '',
  onClick,
  footer,
  headerAction
}) => {
  const cardClasses = [
    'card',
    elevated ? 'card-elevated' : '',
    interactive ? 'card-interactive' : '',
    bordered ? 'card-bordered' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={interactive ? onClick : undefined}
      role={interactive && onClick ? 'button' : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
    >
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 
