import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import { usePartStore } from '../part-store.ts';
import { PostPartUpdateData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPartListQueryKey, postPartUpdateMutation } from '@/api/@tanstack/react-query.gen.ts';
import FormDialog from '@/components/ui/form-dialog';

// 表单验证模式
type FormValues = PostPartUpdateData['body'];

const schema = z.object({
  id: z.string().describe('分区ID'),
  name: z.string().min(1).describe('分区名称'),
});

const EditPartDialog = () => {
  const { isEditDialogOpen, closeEditDialog, currentPart } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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
  }, [currentPart, form.reset]);

  // Update part mutation
  const updatePartMutation = useMutation({
    ...postPartUpdateMutation()
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await updatePartMutation.mutateAsync({ body: data });
      toast.success('分区更新成功');
      queryClient.invalidateQueries({ queryKey: postPartListQueryKey() });
      closeEditDialog();
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditDialogOpen || !currentPart) return null;

  return (
    <FormDialog
      isOpen={isEditDialogOpen}
      onClose={closeEditDialog}
      title="编辑分区"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Input type="hidden" {...form.register('id')} />
      <Input
        label="分区名称"
        placeholder="请输入分区名称"
        error={form.formState.errors.name?.message}
        fullWidth
        {...form.register('name')}
      />
    </FormDialog>
  );
};

export default EditPartDialog;
