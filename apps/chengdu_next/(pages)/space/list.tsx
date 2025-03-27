"use client";

import { useState } from 'react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiFilter, FiPlus, FiSearch } from 'react-icons/fi';
import {PageHeader} from "chengdu_ui";
import {Button} from "chengdu_ui";
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import {DataTable} from "chengdu_ui";
import { useQuery } from '@tanstack/react-query';
import { useSpaceStore } from '@/features/space/space-store';
import SpaceFormDialog from '@/features/space/components/space-form-dialog';
import { useRouter } from 'next/navigation';
import client from "@/lib/api/client";
import SpaceStateToggle from '@/features/space/components/space-state-toggle';
import { SpaceListResponseSchema } from '@/lib/schema/space';
import { z } from 'zod';

type Space = NonNullable<z.infer<typeof SpaceListResponseSchema>['data']>['list'][number];


// 广告位类型映射
const spaceTypeMap: Record<string, string> = {
  TABLE_STICKER: '方桌不干胶贴',
  TABLE_PLACEMAT: '方桌餐垫纸',
  STAND: '立牌',
  X_BANNER: 'X展架',
  TV_LED: '电视/LED屏幕',
  PROJECTOR: '投影仪',
};

// 广告位状态映射
const spaceStateMap: Record<string, { label: string; badge: string }> = {
  ENABLED: { label: '启用', badge: 'badge-success' },
  DISABLED: { label: '禁用', badge: 'badge-error' },
};

// 位置映射
const sitesMap: Record<string, string> = {
  MAIN_AREA: '主客区/大堂',
  SHOP_ENTRANCE: '商家入口',
  ENTRANCE_PASSAGE: '入口通道',
  PRIVATE_ROOM: '独立房间/包间',
  TOILET_PASSAGE: '通往洗手间过道',
  TOILET: '洗手间',
  OUTDOOR_AREA: '商家外摆区/店外公共区',
  OUTSIDE_WALL: '店外墙面(非临街)',
  STREET_WALL: '店外墙面(临街)',
};


// 定义表格列
const columnHelper = createColumnHelper<Space>();

const SpaceListPage = () => {
  const { openAddDialog, openEditDialog } = useSpaceStore();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterState, setFilterState] = useState('');
  const router = useRouter();

  // 获取广告位列表数据
  const { data: spaces, isLoading } = useQuery({
    queryKey: ["spaceList"],
    queryFn: async () => {
      const res = await client.POST("/api/space/list", {
        body: {
          shopId: '',
        },
      });
      return (res?.data?.data?.list || []) as unknown as Space[];
    },
  });

  // 表格列定义
  const columns = [
    // columnHelper.accessor('shopName', {
    //   header: '所属商家',
    //   cell: (info) => info.getValue() || '-',
    // }),
    columnHelper.accessor('type', {
      header: '广告位类型',
      cell: (info) => spaceTypeMap[info.getValue()] || info.getValue(),
    }),
    columnHelper.accessor('count', {
      header: '数量',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: '状态',
      cell: (info) => (
        <div className={`badge badge-sm ${spaceStateMap[info.getValue()]?.badge || ''}`}>
          {spaceStateMap[info.getValue()]?.label || info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('site', {
      header: '位置',
      cell: (info) => {
        const site = info.getValue();
        return site ? sitesMap[site] || site : '-';
      },
    }),
    columnHelper.accessor('price_factor', {
      header: '价格因子',
      cell: (info) => `×${info.getValue() || 1}`,
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
          <SpaceStateToggle
            space={info.row.original as Space}
            variant="icon"
            size="sm"
          />
        </div>
      ),
    }),
  ] as ColumnDef<Space>[];

  // 广告位类型选项
  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'TABLE_STICKER', label: '方桌不干胶贴' },
    { value: 'TABLE_PLACEMAT', label: '方桌餐垫纸' },
    { value: 'STAND', label: '立牌' },
    { value: 'X_BANNER', label: 'X展架' },
    { value: 'TV_LED', label: '电视/LED屏幕' },
    { value: 'PROJECTOR', label: '投影仪' },
  ];

  // 状态选项
  const stateOptions = [
    { value: '', label: '全部状态' },
    { value: 'ENABLED', label: '启用' },
    { value: 'DISABLED', label: '禁用' },
  ];

  // 处理表格行点击
  const handleRowClick = (row: Space) => {
    router.push(`/space/${row.id}`);
  };

  // 过滤数据
  const filteredData = (spaces || []).filter((space) => {
    // 搜索文本过滤
    const textMatch =
      searchText === '' ||
      space.shop?.trademark?.toLowerCase().includes(searchText.toLowerCase()) ||
      spaceTypeMap[space.type]?.toLowerCase().includes(searchText.toLowerCase()) ||
      (space.site && sitesMap[space.site]?.toLowerCase().includes(searchText.toLowerCase()));

    // 广告位类型过滤
    const typeMatch = filterType === '' || space.type === filterType;

    // 状态过滤
    const stateMatch = filterState === '' || space.state === filterState;

    return textMatch && typeMatch && stateMatch;
  });

  return (
    <>
      <PageHeader
        title="广告位管理"
        subtitle="管理商家中的广告位资源"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={openAddDialog}
          >
            新增广告位
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Input
              label="搜索广告位"
              placeholder="输入商家名或广告位类型"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<FiSearch className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="广告位类型"
              options={typeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              leftIcon={<FiFilter className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="状态"
              options={stateOptions}
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
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

      <SpaceFormDialog mode="add" />
      <SpaceFormDialog mode="edit" />
    </>
  );
};

export default SpaceListPage;
