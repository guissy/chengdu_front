import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { usePartStore } from '../part-store.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPartDeleteMutation, postPartListQueryKey } from '@/service/@tanstack/react-query.gen.ts';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const DeletePartDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentPart } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

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
      queryClient.invalidateQueries({
        queryKey: postPartListQueryKey()
      });
      toast.success('小区删除成功');
      closeDeleteDialog();
      router.push('/part');
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDeleteDialogOpen || !currentPart) return null;

  return (
    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={closeDeleteDialog}
      title="删除小区"
      message={`确定要删除小区"${currentPart.name}"吗？此操作不可恢复。`}
      onConfirm={handleDelete}
      isSubmitting={isSubmitting}
      confirmText="删除"
      confirmVariant="error"
    />
  );
};

export default DeletePartDialog;
