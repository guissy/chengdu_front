import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { usePositionStore } from '@/features/position-store';
import FormDialog from '@/components/ui/form-dialog';
import { 
  getShopListUnbindOptions, 
  postPositionBindShopMutation,
  getPositionByIdQueryKey,
  postPositionListQueryKey 
} from '@/service/@tanstack/react-query.gen.ts';
import Select from '@/components/ui/select';

interface FormValues {
  shopId: string;
}

const schema = z.object({
  shopId: z.string().min(1, '请选择要关联的商家'),
});

const BindShopDialog = () => {
  const { isBindShopDialogOpen, closeBindShopDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopId: currentPosition?.shopId || '',
    },
  });

  // 获取未绑定的商家列表
  const { data: shopsData } = useQuery({
    ...getShopListUnbindOptions(),
    select: (data) => data?.data?.list || [],
  });

  // 商家选项
  const shopOptions = (shopsData || []).map((shop) => ({
    value: shop.shopId,
    label: `${shop.trademark}${shop.branch ? ` (${shop.branch})` : ''} - ${shop.shop_no}`,
  }));

  // 绑定商家的mutation
  const bindShopMutation = useMutation({
    ...postPositionBindShopMutation(),
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentPosition) return;

    try {
      setIsSubmitting(true);
      await bindShopMutation.mutateAsync({
        body: {
          id: currentPosition.positionId,
          shopId: data.shopId,
        },
      });
      
      // 更新相关查询
      queryClient.invalidateQueries({
        queryKey: postPositionListQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getPositionByIdQueryKey({ path: { id: currentPosition.positionId } }),
      });
      
      toast.success('商家关联成功');
      closeBindShopDialog();
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isBindShopDialogOpen || !currentPosition) return null;

  return (
    <FormDialog
      isOpen={isBindShopDialogOpen}
      onClose={closeBindShopDialog}
      title="关联商家"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Select
        label="选择商家"
        options={shopOptions}
        error={form.formState.errors.shopId?.message}
        fullWidth
        {...form.register('shopId')}
      />
    </FormDialog>
  );
};

export default BindShopDialog; 