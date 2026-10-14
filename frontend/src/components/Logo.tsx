import React from 'react';

interface LogoProps {
  className?: string;
}

// Plain wordmark, same treatment as LinkVault's header title.
export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <span className={`text-xl font-semibold tracking-wide text-foreground select-none ${className}`}>
      LearnSphere
    </span>
  );
};
