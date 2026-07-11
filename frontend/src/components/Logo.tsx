import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showText = true, className = '', ...props }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary transition-all duration-300 transform hover:scale-105"
        {...props}
      >
        {/* Outer orbital sphere gradient */}
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-40 animate-[spin_40s_linear_infinite]" />
        
        {/* Graduation cap path */}
        <path
          d="M12 5L2 10L12 15L22 10L12 5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-primary/5"
        />
        
        {/* Inner concentric sphere representing data / core knowledge */}
        <circle
          cx="12"
          cy="10.5"
          r="2.5"
          fill="currentColor"
          className="text-primary animate-pulse"
        />
        
        {/* Cap hanging tassel & bottom holder */}
        <path
          d="M6 12v4c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5v-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 10v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Brand Text */}
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-white dark:text-white light:text-foreground">
          Learn<span className="text-primary">Sphere</span>
        </span>
      )}
    </div>
  );
};
