import { forwardRef, type FC, type HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card: FC<CardProps> = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-xl border border-slate-200 shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('p-4 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
);

export const CardContent: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('p-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('p-4 border-t border-slate-100', className)} {...props}>
    {children}
  </div>
);