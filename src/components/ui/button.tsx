import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground shadow hover:bg-primary/90':
              variant === 'default',
            'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90':
              variant === 'destructive',
            'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
            'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80':
              variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground':
              variant === 'ghost',
            'text-primary underline-offset-4 hover:underline':
              variant === 'link',
          },
          {
            // D-06: 44px minimum touch target for default buttons
            'h-9 min-h-[44px] px-4 py-2': size === 'default',
            // 36px minimum for small buttons (still touch-friendly)
            'h-8 min-h-[36px] rounded-md px-3 text-xs': size === 'sm',
            // 44px minimum for large buttons
            'h-10 min-h-[44px] rounded-md px-8': size === 'lg',
            // Icon buttons must be exactly 44x44px minimum
            'h-9 w-9 min-h-[44px] min-w-[44px]': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
