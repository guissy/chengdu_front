import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { shopTypeMap, useShopStore } from '@/features/shop-store';
import FormDialog from '@/components/ui/form-dialog';
import { postShopAddMutation, getShopListUnbindQueryKey } from '@/api/@tanstack/react-query.gen.ts';
import { PostShopAddData } from '@/api/types.gen';


type FormValues = PostShopAddData['body'];

const schema = z.object({
  shop_no: z.string().min(1, '请输入店铺编号'),
  trademark: z.string().min(1, '请输入店铺名称'),
  branch: z.string().optional(),
  type: z.number().min(1, '请选择店铺类型'),
  type_tag: z.string().min(1, '请输入品类标签'),
  total_space: z.number().min(1, '请输入广告位总数'),
  price_base: z.number().min(1, '请输入价格基数'),
  business_type: z.string().default("INDEPENDENT"),
  location: z.tuple([z.number(), z.number()]).default([0, 0]),
  duration: z.string().default("LESS_THAN_ONE"),
  average_expense: z.number().default(0),
});

const AddShopDialog = () => {
  const { isAddDialogOpen, closeAddDialog } = useShopStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shop_no: '',
      trademark: '',
      branch: '',
      type: "RESTAURANT",
      type_tag: '',
      total_space: 0,
      price_base: 0,
      business_type: "INDEPENDENT",
      location: [0, 0],
      duration: "LESS_THAN_ONE",
      average_expense: 0,
    },
  });

  // 使用生成的API mutation
  const addShopMutation = useMutation({
    ...postShopAddMutation(),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await addShopMutation.mutateAsync({ body: data });
      queryClient.invalidateQueries({
        queryKey: getShopListUnbindQueryKey(),
      });
      toast.success('店铺添加成功');
      form.reset();
      closeAddDialog();
    } catch (error) {
      toast.error('添加店铺失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shopTypeOptions = Object.entries(shopTypeMap).map(([value, label]) => ({
    value,
    label,
  }));

  if (!isAddDialogOpen) return null;

  return (
    <FormDialog
      isOpen={isAddDialogOpen}
      onClose={closeAddDialog}
      title="新增店铺"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        label="店铺编号"
        placeholder="请输入店铺编号"
        error={form.formState.errors.shop_no?.message}
        fullWidth
        {...form.register('shop_no')}
      />

      <Input
        label="店铺名称"
        placeholder="请输入店铺名称"
        error={form.formState.errors.trademark?.message}
        fullWidth
        {...form.register('trademark')}
      />

      <Input
        label="分店名称"
        placeholder="请输入分店名称（选填）"
        error={form.formState.errors.branch?.message}
        fullWidth
        {...form.register('branch')}
      />

      <Select
        label="店铺类型"
        options={shopTypeOptions}
        error={form.formState.errors.type?.message}
        fullWidth
        {...form.register('type', { valueAsNumber: true })}
      />

      <Input
        label="品类标签"
        placeholder="请输入品类标签"
        error={form.formState.errors.type_tag?.message}
        fullWidth
        {...form.register('type_tag')}
      />

      <Input
        type="number"
        label="广告位总数"
        placeholder="请输入广告位总数"
        error={form.formState.errors.total_space?.message}
        fullWidth
        {...form.register('total_space', { valueAsNumber: true })}
      />

      <Input
        type="number"
        label="价格基数"
        placeholder="请输入价格基数（元）"
        error={form.formState.errors.price_base?.message}
        fullWidth
        {...form.register('price_base', { valueAsNumber: true })}
      />
    </FormDialog>
  );
};

export default AddShopDialog; 