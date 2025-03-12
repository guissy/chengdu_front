import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { usePartStore } from '../store';
import { PostPartUpdateData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPartListQueryKey, postPartUpdateMutation } from '@/api/@tanstack/react-query.gen.ts';

// 表单验证模式
type FormValues = PostPartUpdateData['body'];

const EditPartDialog = () => {
  const { isEditDialogOpen, closeEditDialog, currentPart } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(z.object({
      id: z.string().describe('分区ID'),
      name: z.string().min(1).describe('分区名称'),
    })),
    defaultValues: {
      id: '',
      name: '',
    },
  });

  // Update form values when currentPart changes
  useEffect(() => {
    if (currentPart) {
      reset({
        id: currentPart.id,
        name: currentPart.name,
      });
    }
  }, [currentPart, reset]);

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

  // Handle dialog close
  const handleClose = () => {
    closeEditDialog();
  };

  if (!isEditDialogOpen || !currentPart) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">编辑分区</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-4">
            <Input type="hidden" {...register('id')} />

            <Input
              label="分区名称"
              placeholder="请输入分区名称"
              error={errors.name?.message}
              fullWidth
              {...register('name')}
            />
          </div>

          <div className="modal-action">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              保存
            </Button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </dialog>
  );
};

export default EditPartDialog;
