import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import { usePartStore } from '../part-store.ts';
import { PostPartUpdateData } from '@/service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPartListQueryKey, postPartUpdateMutation } from '@/service/@tanstack/react-query.gen.ts';
import FormDialog from '@/components/ui/form-dialog';

// 表单验证模式
type FormValues = NonNullable<PostPartUpdateData['body']>;

const schema = z.object({
  id: z.string().describe('小区ID'),
  name: z.string().min(1).describe('小区名称'),
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
  }, [currentPart, form]);

  // Update part mutation
  const updatePartMutation = useMutation({
    ...postPartUpdateMutation()
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await updatePartMutation.mutateAsync({ body: data });
      toast.success('小区更新成功');
      queryClient.invalidateQueries({ queryKey: postPartListQueryKey() });
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
