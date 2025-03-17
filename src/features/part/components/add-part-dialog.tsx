import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { usePartStore } from '../part-store.ts';
import { PostPartAddData } from '@/service';
import { useMutation } from '@tanstack/react-query';
import { postPartAddMutation } from '@/service/@tanstack/react-query.gen.ts';
import { z } from 'zod';
import FormDialog from '@/components/ui/form-dialog';

// 表单验证模式
type FormValues = NonNullable<PostPartAddData['body']>;

const schema = z.object({
  cbdId: z.string().min(1).describe('商圈ID'),
  name: z.string().min(1).describe('小区名称'),
  sequence: z.number().int().positive().describe('排序值'),
});

const AddPartDialog = () => {
  const { isAddDialogOpen, closeAddDialog } = usePartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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
      toast.success('小区添加成功');
      form.reset();
      closeAddDialog();
    } catch (error) {
      // Error handling is done in API client
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAddDialogOpen) return null;

  return (
    <FormDialog
      isOpen={isAddDialogOpen}
      onClose={closeAddDialog}
      title="新增小区"
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
      />

      <Input
        label="小区名称"
        placeholder="请输入小区名称"
        error={form.formState.errors.name?.message}
        fullWidth
        {...form.register('name')}
      />

      <Input
        label="排序值"
        type="number"
        placeholder="请输入排序值"
        error={form.formState.errors.sequence?.message}
        hint="值越大排序越靠前"
        fullWidth
        {...form.register('sequence', { valueAsNumber: true })}
      />
    </FormDialog>
  );
};

export default AddPartDialog;
