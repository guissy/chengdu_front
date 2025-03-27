"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiLink, FiShoppingBag, FiTag, FiTrash2 } from 'react-icons/fi';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {PageHeader} from "chengdu_ui";
import { Button } from "chengdu_ui";
import {DataTable} from "chengdu_ui";
import { shopTypeMap, useShopStore } from '@/features/shop/shop-store';
import ShopFormDialog from '@/features/shop/components/shop-form-dialog';
import DeleteShopDialog from '@/features/shop/components/delete-shop-dialog';
import { formatBusinessHours } from '@/utils/time';
import { useQuery } from '@tanstack/react-query';
import client from "@/lib/api/client";
import { Space } from '@prisma/client';
import { ShopListResponseSchema } from '@/lib/schema/shop';
import { z } from 'zod';

type Shop = NonNullable<z.infer<typeof ShopListResponseSchema>['data']>['list'][number];

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

const ShopDetail = ({ params }: { params: { id: string } }) => {

  const router = useRouter();
  const id = params.id;
  const { openEditDialog, openDeleteDialog } = useShopStore();

  // 获取商家详情
  const { data: shop, isLoading: isLoadingShop } = useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      const res = await client.GET(`/api/shop/{id}`, {
        params: {
          path: {
            id,
          },
        },
      });
      return res.data?.data! as unknown as Shop;
    },
    enabled: !!id,
  });

  // 获取广告位列表
  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    queryKey: ["spaceList", id],
    queryFn: async () => {
      const res = await client.POST("/api/space/list", {
        body: {
          shopId: id!,
        }
      });
      console.log(`☞☞☞ 9527 %c res =`, 'color:red;font-size:16px', res,  'detail');
      return res.data?.data?.list! as unknown as Space[] ?? [];
    },
    // enabled: !!id,
  });
console.log(`☞☞☞ 9527 %c spacesData =`, 'color:red;font-size:16px', spacesData,  'detail');
  // 广告位列定义
  const columnHelper = createColumnHelper<Space>();
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
          onClick={() => router.push(`/space/${info.row.original.id}`)}
        >
          详情
        </Button>
      ),
    }),
  ] as ColumnDef<Space>[], [columnHelper, router]);

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
          onClick={() => router.push('/shop')}
        >
          返回商家列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`商家详情：${shop.trademark}${shop.branch ? ` (${String(shop.branch)})` : ''}`}
        subtitle={`商家编号: ${shop.shop_no || '-'} | ${shopTypeMap[shop.type as keyof typeof shopTypeMap] || shop.type}${shop.type_tag ? ` - ${String(shop.type_tag)}` : ''}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5" />}
              onClick={() => router.push('/shop')}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5" />}
              onClick={() => shop && openEditDialog(shop)}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5" />}
              onClick={() => shop && openDeleteDialog(shop)}
            >
              删除
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-base-100 shadow" data-cy="base-card">
          <div className="card-body">
            <h2 className="card-title">基本信息</h2>
            <div className="divider my-1"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">商家编号</span>
                <span>{shop.shop_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">商标名称</span>
                <span>{shop.trademark}</span>
              </div>
              {shop.branch && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">分店名称</span>
                  <span>{shop.branch}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-content/70">商家类型</span>
                <span>{shopTypeMap[shop.type as keyof typeof shopTypeMap] || shop.type}</span>
              </div>
              {shop.type_tag && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">品类标签</span>
                  <span>{shop.type_tag}</span>
                </div>
              )}
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

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">统计信息</h2>
            <div className="divider my-1"></div>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">广告位总数</div>
                <div className="stat-value">{shop.position?.total_space}</div>
              </div>
              <div className="stat">
                <div className="stat-title">已投放广告位</div>
                <div className="stat-value">{shop.position?.put_space}</div>
              </div>
              <div className="stat">
                <div className="stat-title">价格基数</div>
                <div className="stat-value">¥{(shop.price_base / 100).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 铺位信息 */}
        {shop?.position?.id && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">铺位信息</h2>
              <div className="divider my-1"></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-base-content/70">铺位编号</span>
                  <span>{shop.position.position_no}</span>
                </div>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<FiLink className="h-5 w-5" />}
                    onClick={() => router.push(`/position/${shop?.position?.id}`)}
                  >
                    查看铺位详情
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {formatBusinessHours(shop.business_hours || [])}
              </span>
              </div>
              {shop.rest_days && shop.rest_days.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">休息日</span>
                  <span>
                  {shop.rest_days.map((day: string) => {
                    const weekDayMap = {
                      MONDAY: '周一',
                      TUESDAY: '周二',
                      WEDNESDAY: '周三',
                      THURSDAY: '周四',
                      FRIDAY: '周五',
                      SATURDAY: '周六',
                      SUNDAY: '周日',
                      ON_DEMAND: '按需'
                    };
                    return <span key={day} className="mr-2">{weekDayMap[day as keyof typeof weekDayMap]}</span>;
                  })}
                </span>
                </div>
              )}
              {shop.volume_peak && shop.volume_peak.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">高峰时段</span>
                  <span>
                  {shop.volume_peak.map((peak: string) => {
                    const peakTimeMap: Record<string, string> = {
                      BREAKFAST: '早餐',
                      LUNCH: '午餐',
                      DINNER: '晚餐',
                      LATE_NIGHT: '宵夜',
                      MORNING: '上午',
                      AFTERNOON: '下午',
                      EVENING: '晚上',
                      MIDNIGHT: '深夜'
                    };
                    const period = peakTimeMap[peak as keyof typeof peakTimeMap];
                    return <span key={peak} className="mr-2">{period}</span>;
                  })}
                </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {shop.environment_photo && shop.environment_photo.length > 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">商家照片</h2>
            <div className="divider my-1"></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {shop.environment_photo.map((photo: string, index: number) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={photo}
                    alt={`商家照片 ${index + 1}`}
                    data-cy="environment-photo"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 广告位列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">广告位列表</h2>
          <div className="divider my-1"></div>
          <DataTable
            columns={columns}
            data={spacesData as Space[]}
            loading={isLoadingSpaces}
            onRowClick={(row) => router.push(`/space/${row.id}`)}
          />
        </div>
      </div>

      {/* 添加对话框组件 */}
      <ShopFormDialog mode='edit' />
      <DeleteShopDialog />
    </div>
  );
};

export default ShopDetail;
