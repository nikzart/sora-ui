import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-sage-800 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30',
            'text-sage-900 placeholder:text-sage-600',
            'focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent',
            'transition-all',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
