import { forwardRef } from 'react';
import clsx from 'clsx';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, fullWidth, ...props }, ref) => {
    return (
      <div className={clsx('form-control w-full', { 'w-full': fullWidth })}>
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'textarea textarea-bordered h-24',
            {
              'textarea-error': error,
              'w-full': fullWidth,
            },
            className
          )}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea; 