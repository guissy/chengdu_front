import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import DataTable from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';

// 简化的店铺类型
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
  type: number;
  type_tag: string | null;
  photo: string[];
  remark: string | null;
  business_hours: number[];
}

// 店铺类型映射
const shopTypeMap: Record<number, string> = {
  1: '餐饮',
  2: '轻食',
  3: '茶楼',
  4: '茶饮/咖啡',
  5: '咖啡馆',
  6: '酒店',
};

// 定义表格列
const columnHelper = createColumnHelper<Shop>();

const ShopListPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  // 获取店铺列表数据
  const { data, isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      // 这里模拟店铺列表API
      // 实际应该有类似 return get('/shop/list') 的API调用
      return {
        list: [
          {
            shopId: 'shop-001',
            shop_no: 'SH00001',
            trademark: '巴蜀大将',
            branch: null,
            total_space: 8,
            put_space: 5,
            price_base: 8000,
            verified: true,
            displayed: true,
            type: 1,
            type_tag: '火锅',
            photo: ['https://placehold.co/300x200'],
            remark: null,
            business_hours: [1100, 2300],
          },
          {
            shopId: 'shop-002',
            shop_no: 'SH00002',
            trademark: '咖啡工场',
            branch: '三里屯店',
            total_space: 6,
            put_space: 3,
            price_base: 7500,
            verified: true,
            displayed: true,
            type: 4,
            type_tag: '精品咖啡',
            photo: ['https://placehold.co/300x200'],
            remark: null,
            business_hours: [800, 2200],
          },
          {
            shopId: 'shop-003',
            shop_no: 'SH00003',
            trademark: '罗马假日',
            branch: '北京店',
            total_space: 10,
            put_space: 8,
            price_base: 15000,
            verified: true,
            displayed: true,
            type: 1,
            type_tag: '意大利餐厅',
            photo: ['https://placehold.co/300x200'],
            remark: null,
            business_hours: [1100, 2300],
          },
          {
            shopId: 'shop-004',
            shop_no: 'SH00004',
            trademark: '粤香阁',
            branch: '国贸店',
            total_space: 12,
            put_space: 9,
            price_base: 12000,
            verified: true,
            displayed: true,
            type: 1,
            type_tag: '粤菜',
            photo: ['https://placehold.co/300x200'],
            remark: null,
            business_hours: [1100, 2200],
          },
          {
            shopId: 'shop-005',
            shop_no: 'SH00005',
            trademark: '蜀香坊',
            branch: null,
            total_space: 9,
            put_space: 7,
            price_base: 18000,
            verified: false,
            displayed: true,
            type: 1,
            type_tag: '川菜',
            photo: ['https://placehold.co/300x200'],
            remark: null,
            business_hours: [1000, 2200],
          },
        ] as Shop[],
      };
    },
  });

  // 表格列定义
  const columns = [
    columnHelper.accessor('shop_no', {
      header: '店铺编号',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('trademark', {
      header: '店铺名称',
      cell: (info) => {
        const branch = info.row.original.branch;
        return branch ? `${info.getValue()}(${branch})` : info.getValue();
      },
    }),
    columnHelper.accessor('type', {
      header: '店铺类型',
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
            onClick={(e) => {
              e.stopPropagation();
              alert('删除店铺功能待实现');
            }}
          >
            删除
          </Button>
        </div>
      ),
    }),
  ] as ColumnDef<Shop>[];

  // 店铺类型选项
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

  // 过滤数据
  const filteredData = (data?.list || []).filter((shop) => {
    // 搜索文本过滤
    const textMatch =
      searchText === '' ||
      shop.shop_no.toLowerCase().includes(searchText.toLowerCase()) ||
      shop.trademark.toLowerCase().includes(searchText.toLowerCase()) ||
      (shop.branch && shop.branch.toLowerCase().includes(searchText.toLowerCase())) ||
      (shop.type_tag && shop.type_tag.toLowerCase().includes(searchText.toLowerCase()));

    // 店铺类型过滤
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
        title="店铺管理"
        subtitle="管理店铺信息和广告位资源"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={() => alert('新增店铺功能待实现')}
          >
            新增店铺
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Input
              label="搜索店铺"
              placeholder="输入店铺编号或名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<FiSearch className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="店铺类型"
              options={typeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              // leftIcon={<FiFilter className="h-5 w-5" />}
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
    </>
  );
};

export default ShopListPage;
