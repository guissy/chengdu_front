import { ReactNode } from 'react';
import Button from './button';

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  isSubmitting?: boolean;
}

const BaseDialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  isSubmitting = false,
}: BaseDialogProps) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        {children}
        {footer || (
          <div className="modal-action">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </dialog>
  );
};

export default BaseDialog; 