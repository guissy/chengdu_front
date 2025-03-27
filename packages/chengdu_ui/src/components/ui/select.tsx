import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  value?: string | number | undefined;
  leftIcon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, hint, className, fullWidth = false, disabled, value, leftIcon, ...rest },
    ref
  ) => {
    return (
      <div className={`form-control ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={twMerge(
              'select select-bordered w-full',
              leftIcon && 'pl-10', // Add padding when leftIcon is present
              error && 'select-error',
              disabled && 'select-disabled',
              className
            )}
            disabled={disabled}
            value={value}
            {...rest}
          >
            <option value="" disabled>
              请选择
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
        {hint && !error && (
          <label className="label">
            <span className="label-text-alt">{hint}</span>
          </label>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
