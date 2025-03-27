import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.RefAttributes<HTMLButtonElement | HTMLAnchorElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  as?: 'button' | 'a';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  icon,
  iconPosition = 'left',
  href,
  as = 'button',
  fullWidth = false,
  ...rest
}: ButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) => {
  const baseClasses = `btn btn-${variant} btn-${size}`;
  const widthClass = fullWidth ? 'w-full' : '';
  const classes = twMerge(baseClasses, widthClass, className);

  const content = (
    <>
      {isLoading && <span className="loading loading-spinner"></span>}
      {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </Link>
    );
  }

  if (as === 'a') {
    return (
      <a className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest as React.RefAttributes<HTMLButtonElement>}
    >
      {content}
    </button>
  );
};

export default Button;
