import React from 'react';
import { FiX } from 'react-icons/fi';
import { ToastProps, useToast } from './useToast';

const toastVariants = {
  default: 'bg-white border border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border border-red-200 text-red-800',
  success: 'bg-green-50 border border-green-200 text-green-800',
  warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border border-blue-200 text-blue-800',
};

interface ToastItemProps extends ToastProps {
  onClose: () => void;
}

export const Toast: React.FC<ToastItemProps> = ({
                                                  title,
                                                  description,
                                                  variant = 'default',
                                                  onClose
                                                }) => {
  return (
    <div
      className={`${toastVariants[variant]} shadow-lg rounded-md p-4 mb-3 flex items-start relative animate-in slide-in-from-right-full`}
      role="alert"
    >
      <div className="flex-1 pr-8">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 p-1 rounded-md hover:bg-gray-100"
        aria-label="关闭"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 max-w-md z-50 w-full pointer-events-none flex flex-col items-end">
      <div className="space-y-2 w-full pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => dismiss(toast.id!)}
          />
        ))}
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};
