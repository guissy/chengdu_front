import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { usePartStore } from '../store';
import { PostPartAddData } from '@/api';
import { useMutation } from '@tanstack/react-query';
import { postPartAddMutation } from '@/api/@tanstack/react-query.gen.ts';
import { z } from 'zod';

// 表单验证模式
type FormValues = PostPartAddData['body'];

const AddPartDialog = () => {
  const { isAddDialogOpen, closeAddDialog } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        cbdId: z.string().describe('商圈ID'),
        name: z.string().min(1).describe('分区名称'),
        sequence: z.number().int().positive().describe('排序值'),
      })
    ),
    defaultValues: {
      cbdId: '',
      name: '',
      sequence: 1,
    },
  });

  // Add part mutation
  const addPartMutation = useMutation({
    ...postPartAddMutation()
  });

  // 商圈选项（实际应用中应该从API获取）
  const cbdOptions = [
    { value: 'cbd-001', label: '三里屯' },
    { value: 'cbd-002', label: '国贸' },
    { value: 'cbd-005', label: '中关村' },
    { value: 'cbd-008', label: '南京西路' },
    { value: 'cbd-020', label: '太古里' },
  ];

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await addPartMutation.mutateAsync({ body: data });
      toast.success('分区添加成功');
      reset();
      closeAddDialog();
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    reset();
    closeAddDialog();
  };

  if (!isAddDialogOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">新增分区</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-4">
            <Select
              label="所属商圈"
              options={cbdOptions}
              error={errors.cbdId?.message}
              fullWidth
              {...register('cbdId')}
            />

            <Input
              label="分区名称"
              placeholder="请输入分区名称"
              error={errors.name?.message}
              fullWidth
              {...register('name')}
            />

            <Input
              label="排序值"
              type="number"
              placeholder="请输入排序值"
              error={errors.sequence?.message}
              hint="值越大排序越靠前"
              fullWidth
              {...register('sequence', { valueAsNumber: true })}
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

export default AddPartDialog;
