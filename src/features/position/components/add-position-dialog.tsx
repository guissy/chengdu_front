import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { PostPositionAddData } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postPositionAddMutation,
  postPartListOptions, postCbdListOptions,
  postPositionListQueryKey
} from '@/api/@tanstack/react-query.gen.ts';
import { z } from 'zod';
import { usePositionStore } from '@/features/position-store.ts';

// Form validation schema
type FormValues = PostPositionAddData['body'];

const AddPositionDialog = () => {
  const { isAddDialogOpen, closeAddDialog } = usePositionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [selectedCbdId, setSelectedCbdId] = useState(filterCbdId || '');
  const queryClient = useQueryClient();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        cbdId: z.string().min(1).describe('商圈ID'),
        partId: z.string().min(1).describe('分区ID'),
        no: z.string().min(1).describe('铺位编号'),
      })
    ),
    defaultValues: {
      cbdId: '',
      partId: '',
      no: '',
    },
  });

  // Watch for cbdId changes to update partId options
  const watchedCbdId = watch('cbdId');

  // Add position mutation
  const addPositionMutation = useMutation({
    ...postPositionAddMutation()
  });

  // Fetch parts for selected CBD
  const { data: partsData } = useQuery({
    ...postPartListOptions({
      body: {
        cbdId: watchedCbdId,
      }
    }),
    select: (data) => data.data?.list || [],
    enabled: !!watchedCbdId,
  });

  // const selectedCity = "city-005";
  // const {
  //   data: districts,
  //   isLoading: isLoadingDistricts,
  //   refetch: refetchDistricts,
  // } = useQuery({
  //   ...postDistrictListOptions({
  //     body: { parentId: selectedCity }
  //   }),
  //   select: (data) => data?.data?.list || [],
  //   enabled: !!selectedCity
  // });

  const selectedDistrict = "dist-001";
  const {
    data: cbds,
    // isLoading: isLoadingCbds,
  } = useQuery({
    ...postCbdListOptions({
      body: { districtId: selectedDistrict }
    }),
    select: (data) => data?.data?.list || [],
    enabled: !!selectedDistrict,
  });

  // 商圈选项（实际应用中应该从API获取）
  const cbdOptions = useMemo(() => {
    return cbds?.map(cbd => ({
      value: cbd.id,
      label: cbd.name
    })) || [];
  }, [cbds]);


  // Transform parts data into select options
  const partOptions = (partsData || []).map(part => ({
    value: part.id,
    label: part.name
  }));

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await addPositionMutation.mutateAsync({ body: data });
      queryClient.invalidateQueries({
        queryKey: postPositionListQueryKey(),
      });
      toast.success('铺位添加成功');
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

  // Handle CBD selection change
  const handleCbdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cbdId = e.target.value;
    setValue('cbdId', cbdId);
    setValue('partId', ''); // Reset partId when cbdId changes
  };

  if (!isAddDialogOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">新增铺位</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-4">
            <Select
              label="所属商圈"
              options={cbdOptions}
              error={errors.cbdId?.message}
              fullWidth
              {...register('cbdId')}
              onChange={handleCbdChange}
            />

            <Select
              label="所属分区"
              options={partOptions}
              error={errors.partId?.message}
              fullWidth
              disabled={!watchedCbdId}
              {...register('partId')}
            />

            <Input
              label="铺位编号"
              placeholder="请输入铺位编号"
              error={errors.no?.message}
              fullWidth
              {...register('no')}
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

export default AddPositionDialog;
