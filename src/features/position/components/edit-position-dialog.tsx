import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { PostPositionUpdateData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPositionByIdQueryKey,
  postPositionListQueryKey,
  postPositionUpdateMutation
} from '@/api/@tanstack/react-query.gen.ts';
import { z } from 'zod';
import { usePositionStore } from '@/features/position-store.ts';

// Form validation schema
type FormValues = PostPositionUpdateData['body'];

const EditPositionDialog = () => {
  const { isEditDialogOpen, closeEditDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        id: z.string().describe('铺位ID'),
        no: z.string().min(1).describe('铺位编号'),
      })
    ),
    defaultValues: {
      id: '',
      no: '',
    },
  });

  // Update form values when currentPosition changes
  useEffect(() => {
    if (currentPosition) {
      reset({
        id: currentPosition.positionId,
        no: currentPosition.position_no,
      });
    }
  }, [currentPosition, reset]);

  // Update position mutation
  const updatePositionMutation = useMutation({
    ...postPositionUpdateMutation()
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await updatePositionMutation.mutateAsync({ body: data });
      queryClient.invalidateQueries({
        queryKey: postPositionListQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getPositionByIdQueryKey({ path: { id: currentPosition?.positionId as string } }),
      });
      toast.success('铺位更新成功');
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

  if (!isEditDialogOpen || !currentPosition) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">编辑铺位</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-4">
            <Input
              label="铺位编号"
              placeholder="请输入铺位编号"
              error={errors.no?.message}
              fullWidth
              {...register('no')}
            />

            {/* Hidden field for position ID */}
            <input type="hidden" {...register('id')} />
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

export default EditPositionDialog;
