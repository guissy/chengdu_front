import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { usePositionStore } from '@/features/position/position-store';
import {FormDialog} from "chengdu_ui";
import client from "@/lib/api/client";
import {Select} from "chengdu_ui";

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
      shopId: (currentPosition?.shopId as string) || '',
    },
  });
  // 获取未绑定的商家列表
  const { data: shopsData } = useQuery({
    queryKey: ["shopListUnbind"],
    queryFn: async () => {
      const res = await client.GET("/api/shop/listUnbind");
      return res.data?.data?.list || [];
    }
  });

  // 商家选项
  const shopOptions = (shopsData || []).map((shop) => ({
    value: shop.shopId,
    label: `${shop.trademark}${shop.branch ? ` (${shop.branch})` : ''} - ${shop.shop_no}`,
  }));

  // 绑定商家的mutation
  const bindShopMutation = useMutation({
    mutationFn: (data: { id: string; shopId: string }) =>
      client.POST("/api/position/bindShop", { body: data }),
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentPosition) return;

    try {
      setIsSubmitting(true);
      await bindShopMutation.mutateAsync({
        id: currentPosition.id,
        shopId: data.shopId,
      });

      // 更新相关查询
      queryClient.invalidateQueries({
        queryKey: ["positionList"],
      });
      queryClient.invalidateQueries({
        queryKey: ["position", currentPosition.id],
      });

      toast.success('商家关联成功');
      closeBindShopDialog();
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
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
