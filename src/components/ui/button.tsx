import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === 'primary' &&
            'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
          variant === 'secondary' &&
            'bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-foreground',
          variant === 'outline' &&
            'border text-foreground hover:bg-accent hover:text-accent-foreground',
          variant === 'ghost' &&
            'hover:bg-accent hover:text-accent-foreground',
          variant === 'danger' &&
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-9 rounded-md px-3',
          size === 'lg' && 'h-11 rounded-md px-8',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
