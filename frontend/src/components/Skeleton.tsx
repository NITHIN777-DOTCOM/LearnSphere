import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  animation = 'pulse',
  className = '',
  ...props
}) => {
  const baseStyle = 'bg-muted-bg';
  
  const variants = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded-md',
    circle: 'h-12 w-12 rounded-full',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
    none: '',
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${animations[animation]} ${className}`}
      {...props}
    />
  );
};
