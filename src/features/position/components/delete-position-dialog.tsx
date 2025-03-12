import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPositionDeleteMutation, postPositionListQueryKey } from '@/api/@tanstack/react-query.gen.ts';
import { usePositionStore } from '@/features/position-store.ts';
import { useNavigate } from 'react-router-dom';

const DeletePositionDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Delete position mutation
  const deletePositionMutation = useMutation({
    ...postPositionDeleteMutation({
      body: { id: currentPosition?.positionId as string }
    }),
  });

  // Delete handler
  const handleDelete = async () => {
    if (!currentPosition) return;

    try {
      setIsSubmitting(true);
      await deletePositionMutation.mutateAsync({ body: { id: currentPosition.positionId } });
      queryClient.invalidateQueries({
        queryKey: postPositionListQueryKey()
      });
      toast.success('铺位删除成功');
      closeDeleteDialog();
      navigate('/position');
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

  if (!isDeleteDialogOpen || !currentPosition) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">删除铺位</h3>
        <p className="py-4">
          确定要删除铺位"{currentPosition.position_no}"吗？此操作不可恢复。
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

export default DeletePositionDialog;
