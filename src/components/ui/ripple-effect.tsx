

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rippleColor?: string;
  duration?: number;
}

const Ripple: React.FC<RippleProps & { color: string; duration: number }> = ({ 
  x, 
  y, 
  size, 
  color, 
  duration 
}) => {
  return (
    <span
      className="absolute rounded-full pointer-events-none animate-ripple"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        animation: `ripple ${duration}ms ease-out`,
      }}
    />
  );
};

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
}) => {
  const [ripples, setRipples] = useState<(RippleProps & { id: number })[]>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  }, [disabled, duration]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <Ripple
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          size={ripple.size}
          color={rippleColor}
          duration={duration}
        />
      ))}
    </div>
  );
};

export const useRipple = (
  rippleColor: string = 'rgba(255, 255, 255, 0.3)',
  duration: number = 600
) => {
  const [ripples, setRipples] = useState<(RippleProps & { id: number })[]>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  }, [duration]);

  const rippleElements = ripples.map(ripple => (
    <Ripple
      key={ripple.id}
      x={ripple.x}
      y={ripple.y}
      size={ripple.size}
      color={rippleColor}
      duration={duration}
    />
  ));

  return { addRipple, rippleElements };
}; 





