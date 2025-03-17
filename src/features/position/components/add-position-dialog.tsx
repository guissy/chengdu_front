import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { PostPositionAddData } from '@/service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postCbdListOptions,
  postPartListOptions,
  postPositionAddMutation,
  postPositionListQueryKey
} from '@/service/@tanstack/react-query.gen.ts';
import { z } from 'zod';
import { usePositionStore } from '@/features/position-store.ts';
import FormDialog from '@/components/ui/form-dialog';

type FormValues = NonNullable<PostPositionAddData['body']>;

const schema = z.object({
  cbdId: z.string().min(1).describe('商圈ID'),
  partId: z.string().min(1).describe('小区ID'),
  no: z.string().min(1).describe('铺位编号'),
});

const AddPositionDialog = () => {
  const { isAddDialogOpen, closeAddDialog } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cbdId: '',
      partId: '',
      no: '',
    },
  });

  const watchedCbdId = form.watch('cbdId');

  const addPositionMutation = useMutation({
    ...postPositionAddMutation()
  });

  const { data: partsData } = useQuery({
    ...postPartListOptions({
      body: {
        cbdId: watchedCbdId,
      }
    }),
    select: (data) => data.data?.list || [],
    enabled: !!watchedCbdId,
  });

  const selectedDistrict = "dist-001";
  const { data: cbds } = useQuery({
    ...postCbdListOptions({
      body: { districtId: selectedDistrict }
    }),
    select: (data) => data?.data?.list || [],
    enabled: !!selectedDistrict,
  });

  const cbdOptions = useMemo(() => {
    return cbds?.map(cbd => ({
      value: cbd.id,
      label: cbd.name
    })) || [];
  }, [cbds]);

  const partOptions = (partsData || []).map(part => ({
    value: part.id,
    label: part.name
  }));

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await addPositionMutation.mutateAsync({ body: data });
      queryClient.invalidateQueries({
        queryKey: postPositionListQueryKey(),
      });
      toast.success('铺位添加成功');
      form.reset();
      closeAddDialog();
    } catch (error) {
      // Error handling is done in API client
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCbdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cbdId = e.target.value;
    form.setValue('cbdId', cbdId);
    form.setValue('partId', '');
  };

  if (!isAddDialogOpen) return null;

  return (
    <FormDialog
      isOpen={isAddDialogOpen}
      onClose={closeAddDialog}
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
};

export default AddPositionDialog;
