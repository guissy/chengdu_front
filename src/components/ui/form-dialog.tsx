import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import BaseDialog from './base-dialog';
import Button from './button';

interface FormDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  isSubmitting: boolean;
}

const FormDialog = <T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  children,
  form,
  onSubmit,
  isSubmitting,
}: FormDialogProps<T>) => {
  const handleClose = () => {
    form.reset();
    onClose();
  };


  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      isSubmitting={isSubmitting}
      footer={
        <div className="modal-action">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            form="form-dialog"
          >
            保存
          </Button>
        </div>
      }
    >
      <form id="form-dialog" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-4 space-y-4">
          {children}
        </div>
      </form>
    </BaseDialog>
  );
};

export default FormDialog; 