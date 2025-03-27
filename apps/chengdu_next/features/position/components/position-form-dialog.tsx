import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import {FormDialog} from "chengdu_ui";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { usePositionStore } from '@/features/position/position-store';

// 表单验证 schema
const addSchema = z.object({
  cbdId: z.string().min(1, '请选择商圈').describe('商圈ID'),
  partId: z.string().min(1, '请选择小区').describe('小区ID'),
  no: z.string().min(1, '请输入铺位编号').describe('铺位编号'),
});
const editSchema = z.object({
  no: z.string().min(1, '请输入铺位编号').describe('铺位编号'),
});

type FormValue = z.infer<typeof addSchema | typeof editSchema>;

interface PositionFormDialogProps {
  mode: 'add' | 'edit';
}

type AddFormValues = z.infer<typeof addSchema>;
type EditFormValues = z.infer<typeof editSchema>;

interface AddFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<AddFormValues>;
  onSubmit: (data: AddFormValues) => Promise<void>;
  isSubmitting: boolean;
  cbdOptions: { value: string; label: string; }[];
  partOptions: { value: string; label: string; }[];
  watchedCbdId: string | undefined;
  handleCbdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface EditFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<EditFormValues>;
  onSubmit: (data: EditFormValues) => Promise<void>;
  isSubmitting: boolean;
}

function AddFormDialog({ isOpen, onClose, form, onSubmit, isSubmitting, cbdOptions, partOptions, watchedCbdId, handleCbdChange }: AddFormDialogProps) {
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="新增铺位"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Select
        label="所属商圈"
        options={cbdOptions}
        error={form.formState.errors.cbdId?.message}
        fullWidth
        {...form.register('cbdId')}
        onChange={handleCbdChange}
      />

      <Select
        label="所属小区"
        options={partOptions}
        error={form.formState.errors.partId?.message}
        fullWidth
        disabled={!watchedCbdId}
        {...form.register('partId')}
      />

      <Input
        label="铺位编号"
        placeholder="请输入铺位编号"
        error={form.formState.errors.no?.message}
        fullWidth
        {...form.register('no')}
      />
    </FormDialog>
  );
}

function EditFormDialog({ isOpen, onClose, form, onSubmit, isSubmitting }: EditFormDialogProps) {
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="编辑铺位"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        label="铺位编号"
        placeholder="请输入铺位编号"
        error={form.formState.errors.no?.message}
        fullWidth
        {...form.register('no')}
      />
    </FormDialog>
  );
}

const PositionFormDialog = ({ mode }: PositionFormDialogProps) => {
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    currentPosition,
    closeAddDialog,
    closeEditDialog,
  } = usePositionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = mode === 'add' ? isAddDialogOpen : isEditDialogOpen;
  const onClose = mode === 'add' ? closeAddDialog : closeEditDialog;

  const addForm = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      cbdId: '',
      partId: '',
      no: '',
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      no: currentPosition?.position_no || '',
    },
  });

  const watchedCbdId = addForm.watch('cbdId');

  // 重置表单数据
  useEffect(() => {
    if (mode === 'edit' && currentPosition) {
      editForm.reset({
        no: currentPosition.position_no || '',
      });
    }
  }, [currentPosition, editForm, mode]);

  // 查询商圈列表
  const selectedDistrict = "dist-001";
  const { data: cbds } = useQuery({
    queryKey: ["cbdList", selectedDistrict],
    queryFn: async () => {
      const res = await client.POST("/api/cbd/list", {
        body: { districtId: selectedDistrict }
      });
      return res.data?.data?.list || [];
    },
    enabled: !!selectedDistrict,
  });

  // 查询小区列表
  const { data: partsData } = useQuery({
    queryKey: ["partList", watchedCbdId],
    queryFn: async () => {
      const res = await client.POST("/api/part/list", {
        body: { cbdId: watchedCbdId }
      });
      return res.data?.data?.list || [];
    },
    enabled: !!watchedCbdId,
  });

  // 商圈选项
  const cbdOptions = useMemo(() => {
    return cbds?.map(cbd => ({
      value: cbd.id,
      label: cbd.name
    })) || [];
  }, [cbds]);

  // 小区选项
  const partOptions = useMemo(() => {
    return partsData?.map(part => ({
      value: part.id,
      label: part.name
    })) || [];
  }, [partsData]);

  // 添加铺位 mutation
  const addPositionMutation = useMutation({
    mutationFn: (data: FormValue) =>
      // @ts-ignore
      client.POST("/api/position/add", { body: data as any }),
  });

  // 更新铺位 mutation
  // @ts-ignore
  const updatePositionMutation = useMutation({
    mutationFn: (data: FormValue) =>
      // @ts-ignore
      client.POST("/api/position/update", { body: data as any }),
  });

  const handleAddSubmit = async (data: AddFormValues) => {
    try {
      setIsSubmitting(true);
      await addPositionMutation.mutateAsync(data);
      toast.success('铺位添加成功');
      // 更新列表缓存
      queryClient.invalidateQueries({
        queryKey: ["positionList"],
      });
      addForm.reset();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: EditFormValues) => {
    try {
      setIsSubmitting(true);
      if (currentPosition) {
        await updatePositionMutation.mutateAsync({
          // @ts-ignore
          id: currentPosition.id,
          ...data,
        });
        // 更新详情缓存
        queryClient.invalidateQueries({
          queryKey: ["position", currentPosition.id],
        });
        // 更新列表缓存
        queryClient.invalidateQueries({
          queryKey: ["positionList"],
        });
        toast.success('铺位更新成功');
        editForm.reset();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCbdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cbdId = e.target.value;
    addForm.setValue('cbdId', cbdId);
    addForm.setValue('partId', '');
  };

  if (!isOpen) return null;

  if (mode === 'add') {
    return (
      <AddFormDialog
        isOpen={isOpen}
        onClose={onClose}
        form={addForm}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        cbdOptions={cbdOptions}
        partOptions={partOptions}
        watchedCbdId={watchedCbdId}
        handleCbdChange={handleCbdChange}
      />
    );
  }

  return (
    <EditFormDialog
      isOpen={isOpen}
      onClose={onClose}
      form={editForm}
      onSubmit={handleEditSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default PositionFormDialog;
