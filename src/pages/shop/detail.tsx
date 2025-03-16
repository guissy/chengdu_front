import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiTrash2, FiShoppingBag, FiTag, FiLink } from 'react-icons/fi';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import { getShopByIdOptions, postSpaceListOptions } from '@/api/@tanstack/react-query.gen.ts';
import { ShopResponseSchema, SpaceResponseSchema } from '@/api';
import { shopTypeMap, useShopStore } from '@/features/shop-store.ts';
import ShopFormDialog from '@/features/shop/components/shop-form-dialog';
import DeleteShopDialog from '@/features/shop/components/delete-shop-dialog';
import { formatTime } from '@/utils/time';

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

const ShopDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEditDialog, openDeleteDialog } = useShopStore();
  const [shop, setShop] = useState<ShopResponseSchema | null>(null);

  // 获取商家详情
  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    ...getShopByIdOptions({
      path: { id: id! },
    }),
    select: (data) => data?.data,
    enabled: !!id,
  });

  // 获取广告位列表
  const { data, isLoading: isLoadingSpaces } = useQuery({
    ...postSpaceListOptions({
      body: {
        shopId: id!,
      }
    }),
    enabled: !!id,
  });
  const spacesData = useMemo(() => data?.data?.list || [], [data]);

  // 更新本地state
  useEffect(() => {
    if (shopData) {
      setShop(shopData);
    }
  }, [shopData]);

  // 广告位列定义
  const columnHelper = createColumnHelper<SpaceResponseSchema>();
  const columns = useMemo(() => [
    columnHelper.accessor('type', {
      header: '广告位类型',
      cell: (info) => {
        const type = info.getValue();
        return spaceTypeMap[type as keyof typeof spaceTypeMap] || type;
      },
    }),
    columnHelper.accessor('count', {
      header: '数量',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('state', {
      header: '状态',
      cell: (info) => {
        const state = info.getValue();
        return (
          <span className={`badge ${spaceStateMap[state as keyof typeof spaceStateMap]?.badge || ''}`}>
            {spaceStateMap[state as keyof typeof spaceStateMap]?.label || state}
          </span>
        );
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/space/${info.row.original.id}`)}
        >
          详情
        </Button>
      ),
    }),
  ] as ColumnDef<SpaceResponseSchema>[], [navigate]);

  // 加载中状态
  if (isLoadingShop) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // 商家不存在
  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">商家不存在</h2>
        <p>未找到ID为 {id} 的商家</p>
        <Button
          variant="primary"
          icon={<FiArrowLeft className="h-5 w-5" />}
          onClick={() => navigate('/shop')}
        >
          返回商家列表
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`${shop.trademark}${shop.branch ? ` (${String(shop.branch)})` : ''}`}
        subtitle={`商家编号: ${shop.shop_no || '-'} | ${shopTypeMap[shop.type as keyof typeof shopTypeMap] || shop.type}${shop.type_tag ? ` - ${String(shop.type_tag)}` : ''}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5" />}
              onClick={() => navigate('/shop')}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5" />}
              onClick={() => openEditDialog(shop)}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5" />}
              onClick={() => openDeleteDialog(shop)}
            >
              删除
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 商家基本信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">基本信息</h2>
            <div className="divider my-1"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">商家编号</span>
                <span>{shop?.shop_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">商家类型</span>
                <span>{spaceTypeMap[shop?.type] || `类型${shop?.type}`}</span>
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
                      <FiShoppingBag className="mr-1 h-4 w-4 text-success" />
                      已认证
                    </>
                  ) : (
                    <>
                      <FiTag className="mr-1 h-4 w-4 text-error" />
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
                      <FiLink className="mr-1 h-4 w-4 text-success" />
                      展示中
                    </>
                  ) : (
                    <>
                      <FiTag className="mr-1 h-4 w-4" />
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
                    icon={<FiLink className="h-5 w-5" />}
                    onClick={() => navigate(`/position/${shop.positionId}`)}
                  >
                    查看铺位详情
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="mb-4 text-base-content/70">当前商家未关联铺位</p>
              </div>
            )}
          </div>
        </div>

        {/* 商家规模 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">商家规模</h2>
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
                  {formatTime(shop.business_hours || [])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">休息日</span>
                <span>
                  {shop.rest_days?.map((day) => {
                    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
                    return <span key={day}>{weekday}</span>;
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">高峰时段</span>
                <span>
                  {shop.volume_peak?.map((peak) => {
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
      <div className="mt-6 card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">广告位列表</h2>
          <div className="divider my-1"></div>
          <DataTable
            columns={columns}
            data={spacesData}
            loading={isLoadingSpaces}
          />
        </div>
      </div>

      {/* 添加对话框组件 */}
      <ShopFormDialog mode='edit' />
      <DeleteShopDialog />
    </>
  );
};

export default ShopDetailPage;
