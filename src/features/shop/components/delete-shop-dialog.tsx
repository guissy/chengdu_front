import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useShopStore } from '@/features/shop-store';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { postShopDeleteMutation, getShopListUnbindQueryKey } from '@/api/@tanstack/react-query.gen.ts';
import type { PostShopDeleteData } from '@/api/types.gen';

const DeleteShopDialog = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, currentShop } = useShopStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 使用生成的API mutation
  const deleteShopMutation = useMutation({
    ...postShopDeleteMutation(),
  });

  const handleDelete = async () => {
    if (!currentShop) return;

    try {
      setIsSubmitting(true);
      const body: PostShopDeleteData['body'] = { id: currentShop.shopId };
      await deleteShopMutation.mutateAsync({ body });
      queryClient.invalidateQueries({
        queryKey: getShopListUnbindQueryKey(),
      });
      toast.success('店铺删除成功');
      closeDeleteDialog();
      navigate('/shop');
    } catch (error) {
      toast.error(`删除店铺失败: ${error?.error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDeleteDialogOpen || !currentShop) return null;

  return (
    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={closeDeleteDialog}
      title="删除店铺"
      message={`确定要删除店铺"${currentShop.trademark}${currentShop.branch ? ` (${currentShop.branch})` : ''}"吗？此操作不可恢复。`}
      onConfirm={handleDelete}
      isSubmitting={isSubmitting}
      confirmText="删除"
      confirmVariant="error"
    />
  );
};

export default DeleteShopDialog; 