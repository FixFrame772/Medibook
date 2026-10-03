import React from 'react';
import { cn } from '../lib/utils.ts';

interface BouncingDotsProps {
  className?: string;
  dotClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BouncingDots: React.FC<BouncingDotsProps> = ({ 
  className = "text-current", 
  dotClassName,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5"
  };

  const dotSize = dotClassName || sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center justify-center gap-1.5", className)}>
      <span className={cn("rounded-full bg-current animate-bounce [animation-delay:-0.3s]", dotSize)}></span>
      <span className={cn("rounded-full bg-current animate-bounce [animation-delay:-0.2s]", dotSize)}></span>
      <span className={cn("rounded-full bg-current animate-bounce [animation-delay:-0.1s]", dotSize)}></span>
      <span className={cn("rounded-full bg-current animate-bounce", dotSize)}></span>
    </span>
  );
};

export default BouncingDots;
