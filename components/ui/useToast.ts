import { useCallback, useEffect, useState } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

interface ToastState {
  toasts: ToastProps[];
}

const TOAST_TIMEOUT = 5000;

// 创建一个简单的发布-订阅模式
const listeners: ((state: ToastState) => void)[] = [];
let toastState: ToastState = { toasts: [] };
let toastCounter = 0;

// 通知所有监听器状态变化
const notifyListeners = () => {
  listeners.forEach(listener => listener({ ...toastState }));
};

// 添加新的 toast
const addToast = (props: ToastProps) => {
  const id = props.id || `toast-${toastCounter++}`;
  const newToast = { ...props, id };

  toastState = {
    toasts: [...toastState.toasts, newToast]
  };

  notifyListeners();

  // 自动移除 toast
  const duration = props.duration || TOAST_TIMEOUT;
  setTimeout(() => {
    removeToast(id);
  }, duration);

  return id;
};

// 移除 toast
const removeToast = (id: string) => {
  toastState = {
    toasts: toastState.toasts.filter(toast => toast.id !== id)
  };

  notifyListeners();
};

/**
 * Toast 钩子，用于在应用中显示通知
 */
export function useToast() {
  const [state, setState] = useState<ToastState>(toastState);

  // 订阅状态变化
  useEffect(() => {
    const listener = (newState: ToastState) => {
      setState(newState);
    };

    listeners.push(listener);

    // 初始化时同步状态
    listener({ ...toastState });

    // 清理函数
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback((props: ToastProps) => {
    return addToast(props);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts
  };
}

export default useToast;
