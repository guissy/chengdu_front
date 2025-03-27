"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiFilter, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import {PageHeader} from "chengdu_ui";
import {Button} from "chengdu_ui";
import {Input} from "chengdu_ui";
import {Select} from "chengdu_ui";
import {DataTable} from "chengdu_ui";
import { useQuery } from '@tanstack/react-query';
import { shopTypeMap, useShopStore } from '@/features/shop/shop-store';
import ShopFormDialog from '@/features/shop/components/shop-form-dialog';
import DeleteShopDialog from '@/features/shop/components/delete-shop-dialog';
import client from "@/lib/api/client";
import { z } from 'zod';
import { ShopListResponseSchema } from '@/lib/schema/shop';

type Shop = NonNullable<z.infer<typeof ShopListResponseSchema>['data']>['list'][number];


// 定义表格列
const columnHelper = createColumnHelper<Shop>();

const ShopListPage = () => {
  const router = useRouter();
  const { openAddDialog, openDeleteDialog } = useShopStore();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  // 获取商家列表数据
  const { data, isLoading } = useQuery({
    queryKey: ["shopList"],
    queryFn: async () => {
      const res = await client.GET("/api/shop/list", {
        params: {
          // cbdId: "1",
          // keyword: "1",
        }
      });
      return res.data?.data?.list! as unknown as Shop[] || [];
    },
  });

  // 表格列定义
  const columns = [
    columnHelper.accessor('shop_no', {
      header: '商家编号',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('trademark', {
      header: '商家名称',
      cell: (info) => {
        const branch = info.row.original.branch;
        return branch ? `${info.getValue()}(${branch})` : info.getValue();
      },
    }),
    columnHelper.accessor('type', {
      header: '商家类型',
      cell: (info) => shopTypeMap[info.getValue() as keyof typeof shopTypeMap] || `${info.getValue()}`,
    }),
    columnHelper.accessor('type_tag', {
      header: '品类标签',
      cell: (info) => info.getValue() || '-',
    }),
    // columnHelper.accessor('total_space', {
    //   header: '广告位总数',
    //   cell: (info) => info.getValue(),
    // }),
    // columnHelper.accessor('put_space', {
    //   header: '已投放广告位',
    //   cell: (info) => info.getValue(),
    // }),
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
              router.push(`/shop/${info.row.original.id}`);
            }}
          >
            详情
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FiTrash2 className="h-4 w-4" />}
            onClick={(e) => handleDelete(info.row.original, e)}
          >
            删除
          </Button>
        </div>
      ),
    }),
  ] as ColumnDef<Shop>[];

  // 商家类型选项
  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: '1', label: '餐饮' },
    { value: '2', label: '轻食' },
    { value: '3', label: '茶楼' },
    { value: '4', label: '茶饮/咖啡' },
    { value: '5', label: '咖啡馆' },
    { value: '6', label: '酒店' },
  ];

  // 认证状态选项
  const verifiedOptions = [
    { value: '', label: '全部状态' },
    { value: 'true', label: '已认证' },
    { value: 'false', label: '未认证' },
  ];

  // 处理表格行点击
  const handleRowClick = (row: Shop) => {
    router.push(`/shop/${row.id}`);
  };

  // 修改删除按钮的点击处理函数
  const handleDelete = (shop: Shop, e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteDialog(shop);
  };

  // 过滤数据
  const filteredData = (data || []).filter((shop) => {
    // 搜索文本过滤
    const textMatch =
      searchText === '' ||
      shop.shop_no?.toLowerCase().includes(searchText.toLowerCase()) ||
      shop.trademark?.toLowerCase().includes(searchText.toLowerCase()) ||
      (shop.branch && shop.branch.toLowerCase().includes(searchText.toLowerCase())) ||
      (shop.type_tag && shop.type_tag.toLowerCase().includes(searchText.toLowerCase()));

    // 商家类型过滤
    const typeMatch = filterType === '' || shop.type.toString() === filterType;

    // 认证状态过滤
    const verifiedMatch =
      filterVerified === '' ||
      (filterVerified === 'true' && shop.verified) ||
      (filterVerified === 'false' && !shop.verified);

    return textMatch && typeMatch && verifiedMatch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="商家管理"
        subtitle="管理所有商家信息"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={openAddDialog}
          >
            新增商家
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Input
              label="搜索商家"
              placeholder="输入商家编号或名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<FiSearch className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="商家类型"
              options={typeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              leftIcon={<FiFilter className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="认证状态"
              options={verifiedOptions}
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
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

      {/* 替换对话框组件 */}
      <ShopFormDialog mode="add" />
      <ShopFormDialog mode="edit" />
      <DeleteShopDialog />
    </div>
  );
};

export default ShopListPage;
