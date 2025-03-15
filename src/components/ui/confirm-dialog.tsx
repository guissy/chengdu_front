import BaseDialog from './base-dialog';
import Button from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  confirmText?: string;
  confirmVariant?: 'primary' | 'error';
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  isSubmitting,
  confirmText = '确认',
  confirmVariant = 'primary',
}: ConfirmDialogProps) => {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      isSubmitting={isSubmitting}
      footer={
        <div className="modal-action">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="py-4">{message}</p>
    </BaseDialog>
  );
};

export default ConfirmDialog; 