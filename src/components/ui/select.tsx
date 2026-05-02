import { forwardRef, type FC, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select: FC<SelectProps> = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-4 py-2 border border-slate-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-[#4A7C3C]/20 focus:border-[#4A7C3C]',
            'transition-colors duration-200',
            error && 'border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const SelectContent: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const SelectItem: FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);

export const SelectTrigger: FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, className, onClick 
}) => (
  <div 
    className={clsx('w-full px-4 py-2 border border-slate-300 rounded-lg bg-white', className)}
    onClick={onClick}
  >
    {children}
  </div>
);

export const SelectValue: FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="text-slate-400">{placeholder}</span>
);