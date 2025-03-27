import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      fullWidth = false,
      disabled,
      ...rest
    },
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
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-gray-500 pl-3 z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              'input input-bordered w-full',
              error && 'input-error',
              disabled && 'input-disabled',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            disabled={disabled}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;
