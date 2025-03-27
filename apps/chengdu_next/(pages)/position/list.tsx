import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiLink, FiPlus, FiSearch } from 'react-icons/fi';
import {PageHeader} from "chengdu_ui";
import {Button} from "chengdu_ui";
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import {DataTable} from "chengdu_ui";
import { useQuery } from '@tanstack/react-query';
import { usePositionStore } from '@/features/position/position-store';
import PositionFormDialog from '@/features/position/components/position-form-dialog';
import BindShopDialog from '@/features/shop/components/bind-shop-dialog';
import client from "@/lib/api/client";
import { PositionListResponseSchema } from '@/lib/schema/position';
import { z } from 'zod';

type Position = NonNullable<z.infer<typeof PositionListResponseSchema>['data']>['list'][number];

// 定义表格列
const columnHelper = createColumnHelper<Position>();

const PositionListPage = () => {
  const { filterPartId, setFilterPartId, openAddDialog, openBindShopDialog } = usePositionStore();

  const router = useRouter();
  const queryParams = useSearchParams();
  const partIdFromUrl = queryParams.get('partId') || '';

  const [searchText, setSearchText] = useState('');

  // 当URL中的partId变化时更新筛选状态
  useEffect(() => {
    if (partIdFromUrl && partIdFromUrl !== filterPartId) {
      setFilterPartId(partIdFromUrl);
    }
  }, [partIdFromUrl, filterPartId, setFilterPartId]);

  // 获取铺位列表数据
  const { data: positions, isLoading } = useQuery({
    queryKey: ["positionList", filterPartId],
    queryFn: async () => {
      const res = await client.POST("/api/position/list", {
        body: {
          partId: filterPartId,
        }
      });
      return res.data?.data?.list! as unknown as Position[] || [];
    },
  });

  // 获取小区列表数据（用于筛选）
  const { data: partsData } = useQuery({
    queryKey: ["partList"],
    queryFn: async () => {
      const res = await client.POST("/api/part/list", {
        body: {}
      });
      return res?.data?.data?.list || [];
    }
  });

  // 表格列定义
  const columns = [
    columnHelper.accessor('position_no', {
      header: '铺位编号',
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor('shop_no', {
    //   header: '商家编号',
    //   cell: (info) => info.getValue() || '-',
    // }),
    columnHelper.accessor('type_tag', {
      header: '类型标签',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('total_space', {
      header: '广告位总数',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('put_space', {
      header: '已投放广告位',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('verified', {
      header: '认证状态',
      cell: (info) => (
        <div className="badge badge-sm">
          {info.getValue() ? '已认证' : '未认证'}
        </div>
      ),
    }),
    columnHelper.accessor('displayed', {
      header: '展示状态',
      cell: (info) => (
        <div className={`badge badge-sm ${info.getValue() ? 'badge-success' : 'badge-ghost'}`}>
          {info.getValue() ? '展示中' : '已隐藏'}
        </div>
      ),
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
              router.push(`/position/${info.row.original.id}`);
            }}
          >
            详情
          </Button>
          {!info.row.original.shopId && (
            <Button
              variant="ghost"
              size="sm"
              icon={<FiLink className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation();
                // 这里应该打开关联商家的对话框
                openBindShopDialog(info.row.original);
              }}
            >
              关联商家
            </Button>
          )}
        </div>
      ),
    }),
  ] as ColumnDef<Position>[];

  // 准备小区选项
  const partOptions = [
    { value: '', label: '全部小区' },
    ...(partsData || []).map(part => ({
      value: part.id,
      label: part.name
    }))
  ];

  // 处理表格行点击
  const handleRowClick = (row: Position) => {
    router.push(`/position/${row.id}`);
  };

  // 过滤数据
  const filteredData: Position[] = searchText
    ? (positions || []).filter((position) =>
      position.position_no.toLowerCase().includes(searchText.toLowerCase()) ||
      (position.shop_no && String(position.shop_no).toLowerCase().includes(searchText.toLowerCase())) ||
      (position.type_tag && String(position.type_tag).toLowerCase().includes(searchText.toLowerCase()))
    )
    : positions || [];

  return (
    <>
      <PageHeader
        title="铺位管理"
        subtitle="管理铺位信息和关联的商家"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={openAddDialog}
          >
            新增铺位
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Select
              label="选择小区"
              options={partOptions}
              value={filterPartId}
              onChange={(e) => setFilterPartId(e.target.value)}
              fullWidth
              data-cy="part-select"
            />
          </div>
          <div className="w-full md:w-64">
            <Input
              label="搜索铺位"
              placeholder="输入铺位编号或商家编号"
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

      <PositionFormDialog mode="add" />
      <BindShopDialog />
    </>
  );
};

export default PositionListPage;
