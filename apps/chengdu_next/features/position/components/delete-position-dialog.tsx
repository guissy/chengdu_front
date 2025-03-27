import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { usePositionStore } from '@/features/position/position-store';
import { useRouter } from 'next/navigation';
import {ConfirmDialog} from "chengdu_ui";

const DeletePositionDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Delete position mutation
  const deletePositionMutation = useMutation({
    mutationFn: (data: { id: string }) =>
      client.POST("/api/position/delete", { body: data }),
  });

  // Delete handler
  const handleDelete = async () => {
    if (!currentPosition) return;

    try {
      setIsSubmitting(true);
      await deletePositionMutation.mutateAsync({ id: currentPosition.id });
      queryClient.invalidateQueries({
        queryKey: ["positionList"]
      });
      toast.success('铺位删除成功');
      closeDeleteDialog();
      router.push('/position');
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
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
