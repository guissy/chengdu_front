import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {Input} from "chengdu_ui";
import { usePartStore } from '../part-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from "@/lib/api/client";
import {FormDialog} from "chengdu_ui";
import { PartUpdateRequestSchema } from '@/lib/schema/part';

// 表单验证模式
type FormValues = z.infer<typeof PartUpdateRequestSchema>;

const EditPartDialog = () => {
  const { isEditDialogOpen, closeEditDialog, currentPart } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(PartUpdateRequestSchema),
    defaultValues: {
      id: '',
      name: '',
    },
  });

  // Update form values when currentPart changes
  useEffect(() => {
    if (currentPart) {
      form.reset({
        id: currentPart.id,
        name: currentPart.name,
      });
    }
  }, [currentPart, form]);

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: (data: FormValues) =>
      client.POST("/api/part/update", { body: data }),
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await updatePartMutation.mutateAsync(data);
      toast.success('小区更新成功');
      queryClient.invalidateQueries({ queryKey: ["partList"] });
      closeEditDialog();
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditDialogOpen || !currentPart) return null;

  return (
    <FormDialog
      isOpen={isEditDialogOpen}
      onClose={closeEditDialog}
      title="编辑小区"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Input type="hidden" {...form.register('id')} />
      <Input
        label="小区名称"
        placeholder="请输入小区名称"
        error={form.formState.errors.name?.message}
        fullWidth
        {...form.register('name')}
      />
    </FormDialog>
  );
};

export default EditPartDialog;
