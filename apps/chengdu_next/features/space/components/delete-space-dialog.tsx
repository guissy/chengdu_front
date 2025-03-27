import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { useSpaceStore } from '@/features/space/space-store';
import { useRouter } from 'next/navigation';
import {ConfirmDialog} from "chengdu_ui";

const DeleteSpaceDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentSpace } = useSpaceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Delete space mutation
  const deleteSpaceMutation = useMutation({
    mutationFn: (data: { id: string }) => 
      client.POST("/api/space/delete", { body: data }),
  });

  // Delete handler
  const handleDelete = async () => {
    if (!currentSpace) return;

    try {
      setIsSubmitting(true);
      await deleteSpaceMutation.mutateAsync({ id: currentSpace.id });
      queryClient.invalidateQueries({
        queryKey: ["spaceList", currentSpace.shopId]
      });
      toast.success('空间删除成功');
      closeDeleteDialog();
      router.push('/space');
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
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
