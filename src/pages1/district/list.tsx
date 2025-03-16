"use client";

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table';
import { getCityCityListOptions, postDistrictListOptions } from '@/service/@tanstack/react-query.gen.ts';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { DistrictResponseSchema } from '@/service';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const columnHelper = createColumnHelper<DistrictResponseSchema>();

const districtFormSchema = z.object({
  name: z.string().min(1, '区域名称不能为空'),
  cityId: z.string().min(1, '请选择城市'),
});

type DistrictFormValues = z.infer<typeof districtFormSchema>;

export default function DistrictList() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictResponseSchema | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Hook Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
  });

  // Fetch cities data
  const { data, isLoading: isLoadingCities } = useQuery({
    ...getCityCityListOptions()
  });
  const cities = useMemo(() => data?.data?.list, [data]);

  // Fetch districts data based on selected city
  const {
    data: districts,
    isLoading: isLoadingDistricts,
    refetch: refetchDistricts,
  } = useQuery({
    ...postDistrictListOptions({
      body: { parentId: selectedCity }
    }),
    select: (data) => data?.data?.list || [],
    enabled: !!selectedCity
  });

  // Set default city when cities are loaded
  useEffect(() => {
    if (cities && cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].id);
    }
  }, [cities, selectedCity]);

  // Open modal for adding a new district
  const handleAddDistrict = () => {
    setEditingDistrict(null);
    reset({ cityId: selectedCity, name: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing district
  const handleEditDistrict = (district: DistrictResponseSchema) => {
    setEditingDistrict(district);
    reset({
      name: district.name,
      cityId: selectedCity,
    });
    setIsModalOpen(true);
  };

  // Open confirmation modal for deleting a district
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // TODO: Submit form for adding/editing a district
  const onSubmit = async (data: DistrictFormValues) => {
    try {
      if (editingDistrict) {
        // Update existing district
        // await axios.patch(`/api/districts/${editingDistrict.id}`, data);
        toast.success('区域更新成功');
      } else {
        // Create new district
        // await axios.post('/api/districts', data);
        toast.success('区域添加成功');
      }

      setIsModalOpen(false);
      refetchDistricts();
    } catch (error) {
      toast.error('操作失败，请重试');
      console.error(error);
    }
  };

  // Delete a district
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      // await axios.delete(`/api/districts/${deleteId}`);
      toast.success('区域删除成功');
      setIsDeleteModalOpen(false);
      refetchDistricts();
    } catch (error) {
      toast.error('删除失败，请重试');
      console.error(error);
    }
  };

  // const handleRowClick = (id: string) => {
  //   router.push(`/district/${id}`);
  // };

  const columns = [
    columnHelper.accessor('name', {
      header: '名称',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<FiEdit2 className="h-4 w-4 text-blue-500"/>}
            onClick={(e) => {
              e.stopPropagation();
              handleEditDistrict(info.row.original);
            }}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FiTrash2 className="h-4 w-4 text-red-500"/>}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(info.row.original.id);
            }}
          >
            删除
          </Button>
        </div>
      ),
    }),
  ] as ColumnDef<DistrictResponseSchema>[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="行政区划管理"
        subtitle="管理所有行政区划信息"
        action={
          <button
            className="btn btn-primary"
            onClick={handleAddDistrict}
          >
            <FiPlus className="mr-2"/> 添加区域
          </button>
        }
      />

      {/* City selection */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">选择城市</h2>

          {isLoadingCities ? (
            <div className="flex justify-center">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : (
            <select
              className="select select-bordered w-full max-w-xs"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="" disabled>选择城市</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={districts || []}
        isLoading={isLoadingDistricts}
        // onRowClick={handleRowClick}
      />
    </div>
  );
}
