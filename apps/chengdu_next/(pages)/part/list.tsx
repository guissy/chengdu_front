"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import {PageHeader} from "chengdu_ui";
import { Button } from "chengdu_ui";
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import { DataTable } from "chengdu_ui";
import { usePartStore } from '@/features/part/part-store';
import AddPartDialog from '@/features/part/components/add-part-dialog';
import EditPartDialog from '@/features/part/components/edit-part-dialog';
import DeletePartDialog from '@/features/part/components/delete-part-dialog';
import { useQuery } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { z } from 'zod';
import { PartListResponseSchema } from '@/lib/schema/part';

type Part = NonNullable<z.infer<typeof PartListResponseSchema>['data']>['list'][number];
// Define table columns
const columnHelper = createColumnHelper<Part>();


const PartListPage = () => {
  const router = useRouter();
  const { filterCbdId, setFilterCbdId, openAddDialog, openEditDialog, openDeleteDialog } = usePartStore();
  const [searchText, setSearchText] = useState('');
  // Fetch partition list data
  const { data: partList, isLoading } = useQuery({
    queryKey: ["partList", filterCbdId],
    queryFn: async () => {
      const res = await client.POST("/api/part/list", {
        body: {
          cbdId: filterCbdId,
        }
      });
      return res.data?.data?.list || [];
    }
  });

  // Table column definitions with unknown as the second generic type
  const columns = [
    columnHelper.accessor('id', {
      header: '小区ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      header: '小区名称',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('sequence', {
      header: '排序值',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('total_space', {
      header: '广告位总数',
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
            icon={<FiEdit2 className="h-4 w-4"/>}
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(info.row.original);
            }}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FiTrash2 className="h-4 w-4"/>}
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(info.row.original);
            }}
          >
            删除
          </Button>
        </div>
      ),
    }),
  ] as ColumnDef<Part>[];

  // Business district options (in a real app, this should come from an API)
  const cbdOptions = [
    { value: '', label: '全部商圈' },
    { value: 'cbd-001', label: '三里屯' },
    { value: 'cbd-002', label: '国贸' },
    { value: 'cbd-005', label: '中关村' },
    { value: 'cbd-008', label: '南京西路' },
    { value: 'cbd-020', label: '太古里' },
  ];

  // Handle table row click
  const handleRowClick = ({ id }: Part) => {
    router.push(`/part/${id}`);
  };

  // Filter data based on search text
  const filteredData = searchText
    ? (partList || []).filter((part) =>
      part.name.toLowerCase().includes(searchText.toLowerCase())
    )
    : partList || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="物业小区管理"
        subtitle="管理商圈内的物业小区信息"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5"/>}
            onClick={openAddDialog}
          >
            新增小区
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Select
              label="选择商圈"
              options={cbdOptions}
              value={filterCbdId}
              onChange={(e) => setFilterCbdId(e.target.value)}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Input
              label="搜索小区"
              placeholder="输入小区名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<FiSearch className="h-5 w-5"/>}
              fullWidth
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          loading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Dialog components */}
      <AddPartDialog/>
      <EditPartDialog/>
      <DeletePartDialog/>
    </div>
  );
}

export default PartListPage;
