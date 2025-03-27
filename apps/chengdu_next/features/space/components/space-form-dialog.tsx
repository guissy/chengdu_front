import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import {FormDialog} from "chengdu_ui";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { useSpaceStore } from '../space-store';
import {TextArea} from "chengdu_ui";

// 表单验证 schema
export const spaceSchema = z.object({
  shopId: z.string(),
  type: z.string(),
  setting: z.record(z.string(), z.unknown()),
  count: z.number().int().positive('数量必须大于0').default(1),
  state: z.string(),
  price_factor: z.number().positive('价格因子必须大于0').default(1.0),
  tag: z.string().optional(),
  site: z.string().optional(),
  stability: z.string().optional(),
  // photo: z.array(z.string()).optional(),
  description: z.string().optional(),
  design_attention: z.string().optional(),
  construction_attention: z.string().optional(),
});

type FormValues = z.infer<typeof spaceSchema>;

// 广告位类型选项
const typeOptions = [
  { value: 'TABLE_STICKER', label: '方桌不干胶贴' },
  { value: 'TABLE_PLACEMAT', label: '方桌餐垫纸' },
  { value: 'STAND', label: '立牌' },
  { value: 'X_BANNER', label: 'X展架' },
  { value: 'TV_LED', label: '电视/LED屏幕' },
  { value: 'PROJECTOR', label: '投影仪' },
];

// 状态选项
const stateOptions = [
  { value: 'ENABLED', label: '启用' },
  { value: 'DISABLED', label: '禁用' },
];

// 位置选项
const siteOptions = [
  { value: 'MAIN_AREA', label: '主客区/大堂' },
  { value: 'SHOP_ENTRANCE', label: '商家入口' },
  { value: 'ENTRANCE_PASSAGE', label: '入口通道' },
  { value: 'PRIVATE_ROOM', label: '独立房间/包间' },
  { value: 'TOILET_PASSAGE', label: '通往洗手间过道' },
  { value: 'TOILET', label: '洗手间' },
  { value: 'OUTDOOR_AREA', label: '商家外摆区/店外公共区' },
  { value: 'OUTSIDE_WALL', label: '店外墙面(非临街)' },
  { value: 'STREET_WALL', label: '店外墙面(临街)' },
];

// 稳定性选项
const stabilityOptions = [
  { value: 'FIXED', label: '固定' },
  { value: 'SEMI_FIXED', label: '半固定' },
  { value: 'MOVABLE', label: '移动' },
  { value: 'TEMPORARY', label: '临时' },
];

interface SpaceFormDialogProps {
  mode: 'add' | 'edit';
}

const SpaceFormDialog = ({ mode }: SpaceFormDialogProps) => {
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    currentSpace,
    formData,
    closeAddDialog,
    closeEditDialog,
  } = useSpaceStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = mode === 'add' ? isAddDialogOpen : isEditDialogOpen;
  const onClose = mode === 'add' ? closeAddDialog : closeEditDialog;

  const form = useForm<FormValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form])


  const addSpaceMutation = useMutation({
    mutationFn: (data) =>
      // @ts-ignore
      client.POST("/api/space/add", { body: data }),
  });

  const updateSpaceMutation = useMutation({
    mutationFn: (data) =>
      // @ts-ignore
      client.POST("/api/space/update", { body: data }),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === 'add' && currentSpace?.shopId) {
        // @ts-ignore
        await addSpaceMutation.mutateAsync({
          ...data, shopId: currentSpace.shopId,
        });
        toast.success('广告位添加成功');
      } else if (currentSpace) {
        // @ts-ignore
        await updateSpaceMutation.mutateAsync({
          ...data, id: currentSpace.id,
        });
        queryClient.invalidateQueries({
          queryKey: ["space", currentSpace.id],
        });
        toast.success('广告位更新成功');
      }
      queryClient.invalidateQueries({
        queryKey: ["spaceList", currentSpace?.shopId],
      });
      form.reset();
      onClose();
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? '新增广告位' : '编辑广告位'}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Select
        label="广告位类型"
        options={typeOptions}
        error={form.formState.errors.type?.message}
        fullWidth
        {...form.register('type')}
      />

      <Input
        type="number"
        label="数量"
        error={form.formState.errors.count?.message}
        fullWidth
        {...form.register('count', { valueAsNumber: true })}
      />

      <Select
        label="状态"
        options={stateOptions}
        error={form.formState.errors.state?.message}
        fullWidth
        {...form.register('state')}
      />

      <Input
        type="number"
        label="价格因子"
        step="0.1"
        error={form.formState.errors.price_factor?.message}
        fullWidth
        {...form.register('price_factor', { valueAsNumber: true })}
      />

      <Select
        label="位置"
        options={siteOptions}
        error={form.formState.errors.site?.message}
        fullWidth
        {...form.register('site')}
      />

      <Select
        label="稳定性"
        options={stabilityOptions}
        error={form.formState.errors.stability?.message}
        fullWidth
        {...form.register('stability')}
      />

      <Input
        label="分类标签"
        error={form.formState.errors.tag?.message}
        fullWidth
        {...form.register('tag')}
      />

      <TextArea
        label="投放推介"
        error={form.formState.errors.description?.message}
        fullWidth
        rows={3}
        {...form.register('description')}
      />

      <TextArea
        label="设计注意事项"
        error={form.formState.errors.design_attention?.message}
        fullWidth
        rows={3}
        {...form.register('design_attention')}
      />

      <TextArea
        label="施工注意事项"
        error={form.formState.errors.construction_attention?.message}
        fullWidth
        rows={3}
        {...form.register('construction_attention')}
      />
    </FormDialog>
  );
};

export default SpaceFormDialog;
