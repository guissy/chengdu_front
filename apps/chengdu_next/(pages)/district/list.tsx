"use client";

import { useQuery } from '@tanstack/react-query';
import {PageHeader} from "chengdu_ui";
import { Button } from "chengdu_ui";
import { DataTable } from "chengdu_ui";
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import client from "@/lib/api/client";
import { DistrictListResponseSchema } from '@/lib/schema/location';

type District = NonNullable<z.infer<typeof DistrictListResponseSchema>['data']>['list'][number];
const columnHelper = createColumnHelper<District>();

const districtFormSchema = z.object({
  name: z.string().min(1, '区域名称不能为空'),
  cityId: z.string().min(1, '请选择城市'),
});

type DistrictFormValues = z.infer<typeof districtFormSchema>;

export default function DistrictList() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  // const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Hook Form setup
  const { reset } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
  });

  // Fetch cities data
  const { data: cities, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cityList"],
    queryFn: async () => {
      const res = await client.GET("/api/city/list", {});
      return res.data?.data?.list || [];
    }
  });

  // Fetch districts data based on selected city
  const {
    data: districts,
    isLoading: isLoadingDistricts,
  } = useQuery({
    queryKey: ["districtList", selectedCity],
    queryFn: async () => {
      const res = await client.POST("/api/district/list", {
        body: { parentId: selectedCity }
      });
      return res.data?.data?.list || [];
    },
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
    // setEditingDistrict(null);
    reset({ cityId: selectedCity, name: '' });
    // setIsModalOpen(true);
  };

  // Open modal for editing an existing district
  const handleEditDistrict = (district: District) => {
    // setEditingDistrict(district);
    reset({
      name: district.name,
      cityId: selectedCity,
    });
    // setIsModalOpen(true);
  };

  // Open confirmation modal for deleting a district
  const handleDeleteClick = (id: string) => {
    console.warn(id)
    // setDeleteId(id);
    // setIsDeleteModalOpen(true);
  };

  // TODO: Submit form for adding/editing a district

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
  ] as ColumnDef<District>[];

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
      <DataTable<District>
        columns={columns}
        data={districts || []}
        loading={isLoadingDistricts}
        // onRowClick={handleRowClick}
      />
    </div>
  );
}
