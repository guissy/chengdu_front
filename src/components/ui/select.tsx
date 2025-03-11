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
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, hint, className, fullWidth = false, disabled, value, ...rest },
    ref
  ) => {
    return (
      <div className={`form-control ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <select
          ref={ref}
          className={twMerge(
            'select select-bordered w-full',
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
