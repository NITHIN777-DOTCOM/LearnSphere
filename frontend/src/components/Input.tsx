import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-text pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-card border ${
              error ? 'border-danger focus:ring-danger/30' : 'border-border focus:ring-primary/30'
            } text-foreground rounded-md px-3.5 py-2.5 text-sm placeholder:text-muted-text focus:outline-none focus:ring-2 transition-all duration-200 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted-text cursor-pointer">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted-text">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
