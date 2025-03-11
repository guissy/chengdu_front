import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiEdit2, FiPlus, FiSearch, FiFilter, FiEye, FiEyeOff } from 'react-icons/fi';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import DataTable from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { postSpaceListOptions } from '@/api/@tanstack/react-query.gen.ts';

// 简化的广告位类型
interface Space {
  id: string;
  shopId: string;
  shopName: string;
  type: number;
  count: number;
  state: number;
  priceFactor: number;
  site?: number;
  stability?: number;
  photo: string[];
}

// 广告位类型映射
const spaceTypeMap: Record<number, string> = {
  1: '方桌不干胶贴',
  2: '方桌餐垫纸',
  3: '立牌',
  4: 'X展架',
  5: '电视/LED屏幕',
  6: '投影仪',
};

// 广告位状态映射
const spaceStateMap: Record<number, { label: string; badge: string }> = {
  1: { label: '启用', badge: 'badge-success' },
  2: { label: '禁用', badge: 'badge-error' },
};

// 位置映射
const sitesMap: Record<number, string> = {
  1: '主客区/大堂',
  2: '店铺入口',
  3: '入口通道',
  4: '独立房间/包间',
  5: '通往洗手间过道',
  6: '洗手间',
  7: '店铺外摆区/店外公共区',
  8: '店外墙面(非临街)',
  9: '店外墙面(临街)',
};

// 稳定性映射
const stabilityMap: Record<number, string> = {
  1: '固定',
  2: '半固定',
  3: '移动',
  4: '临时',
};

// 定义表格列
const columnHelper = createColumnHelper<Space>();

const SpaceListPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterState, setFilterState] = useState('');

  // 获取广告位列表数据
  const { data: spaces, isLoading } = useQuery({
    ...postSpaceListOptions({
      body: {
        shopId: 'shop-001',
      },
    }),
    select: (data) => data?.data?.list ?? [],
  });

  // 表格列定义
  const columns = [
    columnHelper.accessor('shopName', {
      header: '所属店铺',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('type', {
      header: '广告位类型',
      cell: (info) => spaceTypeMap[info.getValue()] || `${info.getValue()}`,
    }),
    columnHelper.accessor('count', {
      header: '数量',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: '状态',
      cell: (info) => (
        <div className={`badge badge-sm ${spaceStateMap[info.getValue()]?.badge || ''}`}>
          {spaceStateMap[info.getValue()]?.label || `${info.getValue()}`}
        </div>
      ),
    }),
    columnHelper.accessor('site', {
      header: '位置',
      cell: (info) => info.getValue() ? sitesMap[info.getValue()!] || `位置${info.getValue()}` : '-',
    }),
    columnHelper.accessor('priceFactor', {
      header: '价格因子',
      cell: (info) => `×${info.getValue()}`,
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
              navigate(`/space/${info.row.original.id}`);
            }}
          >
            详情
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={info.row.original.state === 1 ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              alert(`${info.row.original.state === 1 ? '禁用' : '启用'}广告位功能待实现`);
            }}
          >
            {info.row.original.state === 1 ? '禁用' : '启用'}
          </Button>
        </div>
      ),
    }),
  ] as ColumnDef<Space>[];

  // 广告位类型选项
  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: '1', label: '方桌不干胶贴' },
    { value: '2', label: '方桌餐垫纸' },
    { value: '3', label: '立牌' },
    { value: '4', label: 'X展架' },
    { value: '5', label: '电视/LED屏幕' },
    { value: '6', label: '投影仪' },
  ];

  // 状态选项
  const stateOptions = [
    { value: '', label: '全部状态' },
    { value: '1', label: '启用' },
    { value: '2', label: '禁用' },
  ];

  // 处理表格行点击
  const handleRowClick = (row: Space) => {
    navigate(`/space/${row.id}`);
  };

  // 过滤数据
  const filteredData = (spaces || []).filter((space) => {
    // 搜索文本过滤
    const textMatch =
      searchText === '' ||
      space.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
      spaceTypeMap[space.type].toLowerCase().includes(searchText.toLowerCase()) ||
      (space.site && sitesMap[space.site].toLowerCase().includes(searchText.toLowerCase()));

    // 广告位类型过滤
    const typeMatch = filterType === '' || space.type.toString() === filterType;

    // 状态过滤
    const stateMatch = filterState === '' || space.state.toString() === filterState;

    return textMatch && typeMatch && stateMatch;
  });

  return (
    <>
      <PageHeader
        title="广告位管理"
        subtitle="管理店铺中的广告位资源"
        action={
          <Button
            variant="primary"
            icon={<FiPlus className="h-5 w-5" />}
            onClick={() => alert('新增广告位功能待实现')}
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
              placeholder="输入店铺名或广告位类型"
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
    </>
  );
};

export default SpaceListPage;
