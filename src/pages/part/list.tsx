import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import DataTable from '@/components/ui/table';
import { usePartStore } from '@/features/part/part-store.ts';
import AddPartDialog from '@/features/part/components/add-part-dialog';
import EditPartDialog from '@/features/part/components/edit-part-dialog';
import DeletePartDialog from '@/features/part/components/delete-part-dialog';
import { PartResponseSchema } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { postPartListOptions } from '@/api/@tanstack/react-query.gen.ts';

// Define table columns
const columnHelper = createColumnHelper<Part>();
type Part = PartResponseSchema;
const PartListPage = () => {
  const navigate = useNavigate();
  const { filterCbdId, setFilterCbdId, openAddDialog, openEditDialog, openDeleteDialog } = usePartStore();
  const [searchText, setSearchText] = useState('');

  // Fetch partition list data
  const { data, isLoading } = useQuery({
    ...postPartListOptions({
      body: {
        cbdId: filterCbdId,
      }
    }),
    select: (data) => data.data?.list || [],
  });

  // Table column definitions with unknown as the second generic type
  const columns = [
    columnHelper.accessor('id', {
      header: '分区ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      header: '分区名称',
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
            icon={<FiEdit2 className="h-4 w-4" />}
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
            icon={<FiTrash2 className="h-4 w-4" />}
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
  const handleRowClick = (row: Part) => {
    navigate(`/part/${row.id}`);
  };

  // Filter data based on search text
  const filteredData = searchText
    ? (data || []).filter((part: PartResponseSchema) =>
      part.name.toLowerCase().includes(searchText.toLowerCase())
    )
    : data || [];

  return (
    <>
      <PageHeader
        title="物业小区管理"
        subtitle="管理商圈内的物业小区信息"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={openAddDialog}
          >
            新增分区
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
              label="搜索分区"
              placeholder="输入分区名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<FiSearch className="h-5 w-5" />}
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
      <AddPartDialog />
      <EditPartDialog />
      <DeletePartDialog />
    </>
  );
};

export default PartListPage;
