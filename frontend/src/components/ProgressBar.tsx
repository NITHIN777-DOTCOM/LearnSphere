import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  color = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-text">Progress</span>
          <span className="text-xs font-semibold text-foreground">{Math.round(normalizedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-sidebar border border-border/30 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          style={{ width: `${normalizedValue}%` }}
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
        />
      </div>
    </div>
  );
};
