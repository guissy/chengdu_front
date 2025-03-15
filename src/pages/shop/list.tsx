import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import DataTable from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { shopTypeMap, useShopStore } from '@/features/shop-store';
import ShopFormDialog from '@/features/shop/components/shop-form-dialog';
import DeleteShopDialog from '@/features/shop/components/delete-shop-dialog';
import { getShopListOptions } from '@/api/@tanstack/react-query.gen';

// 简化的商家类型
interface Shop {
  shopId: string;
  shop_no: string;
  trademark: string;
  branch: string | null;
  total_space: number;
  put_space: number;
  price_base: number;
  verified: boolean;
  displayed: boolean;
  type: string;
  type_tag: string | null;
  photo: string[];
  remark: string | null;
  business_hours: number[];
}

// 定义表格列
const columnHelper = createColumnHelper<Shop>();

const ShopListPage = () => {
  const navigate = useNavigate();
  const { openAddDialog, openDeleteDialog } = useShopStore();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  // 获取商家列表数据
  const { data, isLoading } = useQuery({
    ...getShopListOptions(),
    select: (data) => data.data?.list || [],
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
      cell: (info) => shopTypeMap[info.getValue()] || `类型${info.getValue()}`,
    }),
    columnHelper.accessor('type_tag', {
      header: '品类标签',
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
              navigate(`/shop/${info.row.original.shopId}`);
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
    navigate(`/shop/${row.shopId}`);
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
      shop.shop_no.toLowerCase().includes(searchText.toLowerCase()) ||
      shop.trademark.toLowerCase().includes(searchText.toLowerCase()) ||
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
    <>
      <PageHeader
        title="商家管理"
        subtitle="管理商家信息和广告位资源"
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
    </>
  );
};

export default ShopListPage;
