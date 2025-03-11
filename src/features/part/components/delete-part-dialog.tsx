import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import { usePartStore } from '../store';
import { useMutation } from '@tanstack/react-query';
import { postPartDeleteMutation } from '@/api/@tanstack/react-query.gen.ts';

const DeletePartDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentPart } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete part mutation
  const deletePartMutation = useMutation({
    ...postPartDeleteMutation({
      body: { id: currentPart?.id as string }
    }),
  });

  // Delete handler
  const handleDelete = async () => {
    if (!currentPart) return;

    try {
      setIsSubmitting(true);
      await deletePartMutation.mutateAsync({ body: { id: currentPart.id } });
      toast.success('分区删除成功');
      closeDeleteDialog();
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    closeDeleteDialog();
  };

  if (!isDeleteDialogOpen || !currentPart) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">删除分区</h3>
        <p className="py-4">
          确定要删除分区"{currentPart.name}"吗？此操作不可恢复。
        </p>
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
            type="button"
            variant="error"
            isLoading={isSubmitting}
            onClick={handleDelete}
          >
            删除
          </Button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </dialog>
  );
};

export default DeletePartDialog;
