import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiCheck, FiX, FiMapPin } from 'react-icons/fi';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import DataTable from '@/components/ui/table.tsx';
import { postSpaceListOptions } from '@/api/@tanstack/react-query.gen.ts';
import { SpaceResponseSchema } from '@/api';

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
  total_area: number | null;
  customer_area: number | null;
  clerk_count: number | null;
  business_hours: number[];
  rest_days: number[];
  volume_peak: number[];
  shop_description: string | null;
  put_description: string | null;
  photo: string[];
  remark: string | null;
  positionId: string | null;
  position_no: string | null;
}

// 简化的广告位类型
interface Space {
  id: string;
  type: number;
  count: number;
  state: number;
  priceFactor: number;
  photo: string[];
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

// 定义广告位表格列
const columnHelper = createColumnHelper<Space>();

const ShopDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);

  // 获取店铺详情
  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shop', id],
    queryFn: async () => {
      // 实际应用应该使用 return get(`/shop/${id}`) 获取详情
      // 这里模拟一个店铺详情数据
      return {
        shopId: id,
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
        total_area: 120,
        customer_area: 100,
        clerk_count: 8,
        business_hours: [1100, 2300],
        rest_days: [1], // 周一休息
        volume_peak: [2, 3], // 午餐、晚餐高峰
        shop_description: '巴蜀大将火锅，源自重庆老火锅配方，选用上等食材，提供正宗重庆麻辣火锅体验。',
        put_description: '店内环境优雅，人均消费适中，客流量大，是投放广告的理想场所。',
        photo: ['https://placehold.co/600x400', 'https://placehold.co/600x400'],
        remark: null,
        positionId: 'pos-001',
        position_no: 'SLT-B1-001',
      } as Shop;
    },
    enabled: !!id,
  });

  // 获取店铺的广告位列表
  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    ...postSpaceListOptions({
      body: { shopId: id! },
    }),
    select: (data) => data.data?.list || [],
    enabled: !!id,
  });

  // 更新本地state
  useEffect(() => {
    if (shopData) {
      setShop(shopData);
    }
  }, [shopData]);

  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/shop');
  };

  // 加载中状态
  if (isLoadingShop) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // 店铺不存在
  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">店铺不存在</h2>
        <p>未找到ID为 {id} 的店铺</p>
        <Button
          variant="primary"
          icon={<FiArrowLeft className="h-5 w-5" />}
          onClick={handleBack}
        >
          返回店铺列表
        </Button>
      </div>
    );
  }

  // 广告位表格列定义
  const columns = [
    columnHelper.accessor('type', {
      header: '广告位类型',
      cell: (info) => spaceTypeMap[info.getValue()] || `类型${info.getValue()}`,
    }),
    columnHelper.accessor('count', {
      header: '数量',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: '状态',
      cell: (info) => (
        <div className={`badge ${spaceStateMap[info.getValue()]?.badge || ''}`}>
          {spaceStateMap[info.getValue()]?.label || `状态${info.getValue()}`}
        </div>
      ),
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
  ] as ColumnDef<SpaceResponseSchema>[];

  return (
    <>
      <PageHeader
        title={`${shop?.trademark}${shop?.branch ? ` (${shop?.branch})` : ''}`}
        subtitle={`店铺编号: ${shop?.shop_no} | ${shopTypeMap[shop?.type] || `类型${shop?.type}`}${shop?.type_tag ? ` - ${shop?.type_tag}` : ''}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5" />}
              onClick={handleBack}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5" />}
              onClick={() => alert('编辑店铺功能待实现')}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5" />}
              onClick={() => alert('删除店铺功能待实现')}
            >
              删除
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 店铺基本信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">基本信息</h2>
            <div className="divider my-1"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">店铺编号</span>
                <span>{shop?.shop_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">店铺类型</span>
                <span>{shopTypeMap[shop?.type] || `类型${shop?.type}`}</span>
              </div>
              {shop?.type_tag && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">品类标签</span>
                  <span>{shop?.type_tag}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-content/70">广告位总数</span>
                <span>{shop?.total_space}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">已投放广告位</span>
                <span>{shop?.put_space}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">价格基数</span>
                <span>¥{(shop?.price_base / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">认证状态</span>
                <span className="flex items-center">
                  {shop?.verified ? (
                    <>
                      <FiCheck className="mr-1 h-4 w-4 text-success" />
                      已认证
                    </>
                  ) : (
                    <>
                      <FiX className="mr-1 h-4 w-4 text-error" />
                      未认证
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">展示状态</span>
                <span className="flex items-center">
                  {shop?.displayed ? (
                    <>
                      <FiEye className="mr-1 h-4 w-4 text-success" />
                      展示中
                    </>
                  ) : (
                    <>
                      <FiEyeOff className="mr-1 h-4 w-4" />
                      已隐藏
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 铺位信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">铺位信息</h2>
            <div className="divider my-1"></div>

            {shop.positionId ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-base-content/70">铺位编号</span>
                  <span>{shop.position_no}</span>
                </div>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<FiMapPin className="h-5 w-5" />}
                    onClick={() => navigate(`/position/${shop.positionId}`)}
                  >
                    查看铺位详情
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="mb-4 text-base-content/70">当前店铺未关联铺位</p>
              </div>
            )}
          </div>
        </div>

        {/* 店铺规模 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">店铺规模</h2>
            <div className="divider my-1"></div>
            <div className="space-y-3">
              {shop.total_area && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">总面积</span>
                  <span>{shop.total_area}㎡</span>
                </div>
              )}
              {!!shop.customer_area && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">客区面积</span>
                  <span>{shop.customer_area}㎡</span>
                </div>
              )}
              {!!shop.clerk_count && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">店员人数</span>
                  <span>{shop.clerk_count}人</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-content/70">营业时间</span>
                <span>
                  {shop.business_hours[0]}:{'00'.padStart(2, '0')} - {shop.business_hours[1]}:{'00'.padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">休息日</span>
                <span>
                  {shop.rest_days.map((day) => {
                    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
                    return <span key={day}>{weekday}</span>;
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">高峰时段</span>
                <span>
                  {shop.volume_peak.map((peak) => {
                    const period = ['午餐', '晚餐'][peak - 1];
                    return <span key={peak}>{period}</span>;
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 广告位列表 */}
      <div className="mt-6">
        <h2 className="card-title">广告位列表</h2>
        <div className="divider my-1"></div>
        <DataTable
          columns={columns}
          data={spacesData || []}
          loading={isLoadingSpaces}
        />
      </div>
    </>
  );
};

export default ShopDetailPage;
