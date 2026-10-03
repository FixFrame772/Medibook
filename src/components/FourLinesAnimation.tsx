import React from 'react';
import { cn } from '../lib/utils.ts';

interface FourLinesAnimationProps {
  className?: string;
  lineClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FourLinesAnimation: React.FC<FourLinesAnimationProps> = ({
  className = "text-current",
  lineClassName,
  size = 'md'
}) => {
  const heights = {
    sm: "h-4 w-1",
    md: "h-6 w-1.5",
    lg: "h-9 w-2"
  };

  const currentHeight = lineClassName || heights[size];

  return (
    <div className={cn("inline-flex items-center justify-center gap-1.5", className)}>
      <span className={cn("rounded-full bg-current animate-[pulse_0.6s_ease-in-out_infinite] [animation-delay:-0.45s]", currentHeight)}></span>
      <span className={cn("rounded-full bg-current animate-[pulse_0.6s_ease-in-out_infinite] [animation-delay:-0.3s]", currentHeight)}></span>
      <span className={cn("rounded-full bg-current animate-[pulse_0.6s_ease-in-out_infinite] [animation-delay:-0.15s]", currentHeight)}></span>
      <span className={cn("rounded-full bg-current animate-[pulse_0.6s_ease-in-out_infinite]", currentHeight)}></span>
    </div>
  );
};

export default FourLinesAnimation;
