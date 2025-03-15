import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSpaceDeleteMutation, postSpaceListQueryKey } from '@/api/@tanstack/react-query.gen.ts';
import { useSpaceStore } from '@/features/space/space-store';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const DeleteSpaceDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentSpace } = useSpaceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Delete space mutation
  const deleteSpaceMutation = useMutation({
    ...postSpaceDeleteMutation({
      body: { id: currentSpace?.id as string }
    }),
  });

  // Delete handler
  const handleDelete = async () => {
    if (!currentSpace) return;

    try {
      setIsSubmitting(true);
      await deleteSpaceMutation.mutateAsync({ body: { id: currentSpace.id } });
      queryClient.invalidateQueries({
        queryKey: postSpaceListQueryKey()
      });
      toast.success('空间删除成功');
      closeDeleteDialog();
      navigate('/space');
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDeleteDialogOpen || !currentSpace) return null;

  return (
    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={closeDeleteDialog}
      title="删除空间"
      message={`确定要删除空间"${currentSpace.type}"吗？此操作不可恢复。`}
      onConfirm={handleDelete}
      isSubmitting={isSubmitting}
      confirmText="删除"
      confirmVariant="error"
    />
  );
};

export default DeleteSpaceDialog; 