'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            id={switchId}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <label
            htmlFor={switchId}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
              'bg-gray-200 transition-colors duration-200 ease-in-out',
              'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              'peer-checked:bg-blue-600',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              'after:absolute after:top-0 after:left-0 after:h-5 after:w-5 after:rounded-full',
              'after:bg-white after:shadow after:transition-transform after:duration-200 after:ease-in-out',
              'peer-checked:after:translate-x-5',
              className
            )}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
