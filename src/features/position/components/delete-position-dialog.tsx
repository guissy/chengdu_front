import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPositionDeleteMutation, postPositionListQueryKey } from '@/service/@tanstack/react-query.gen.ts';
import { usePositionStore } from '@/features/position-store.ts';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const DeletePositionDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

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
      router.push('/position');
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDeleteDialogOpen || !currentPosition) return null;

  return (
    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={closeDeleteDialog}
      title="删除铺位"
      message={`确定要删除铺位"${currentPosition.position_no}"吗？此操作不可恢复。`}
      onConfirm={handleDelete}
      isSubmitting={isSubmitting}
      confirmText="删除"
      confirmVariant="error"
    />
  );
};

export default DeletePositionDialog;
