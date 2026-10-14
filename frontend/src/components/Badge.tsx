import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium select-none transition-colors duration-200';
  
  const variants = {
    default: 'bg-muted-bg text-muted-text border border-border',
    primary: 'bg-primary text-primary-foreground border border-primary',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-primary/5 text-primary border border-primary/10',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
