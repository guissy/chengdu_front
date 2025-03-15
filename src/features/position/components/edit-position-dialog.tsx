import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
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
import FormDialog from '@/components/ui/form-dialog';

type FormValues = PostPositionUpdateData['body'];

const schema = z.object({
  id: z.string().describe('铺位ID'),
  no: z.string().min(1).describe('铺位编号'),
});

const EditPositionDialog = () => {
  const { isEditDialogOpen, closeEditDialog, currentPosition } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: '',
      no: '',
    },
  });

  useEffect(() => {
    if (currentPosition) {
      form.reset({
        id: currentPosition.positionId,
        no: currentPosition.position_no,
      });
    }
  }, [currentPosition, form.reset]);

  const updatePositionMutation = useMutation({
    ...postPositionUpdateMutation()
  });

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

  if (!isEditDialogOpen || !currentPosition) return null;

  return (
    <FormDialog
      isOpen={isEditDialogOpen}
      onClose={closeEditDialog}
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
      <Input type="hidden" {...form.register('id')} />
    </FormDialog>
  );
};

export default EditPositionDialog;
