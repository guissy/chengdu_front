"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiLink, FiShoppingBag, FiTag, FiTrash2 } from 'react-icons/fi';
import {PageHeader} from "chengdu_ui";
import { Button } from "chengdu_ui";
import { usePositionStore } from '@/features/position/position-store';
import PositionFormDialog from '@/features/position/components/position-form-dialog';
import DeletePositionDialog from '@/features/position/components/delete-position-dialog';
import BindShopDialog from '@/features/shop/components/bind-shop-dialog';
import { formatTime } from '@/utils/time';
import client from "@/lib/api/client";
import { PositionListResponseSchema } from '@/lib/schema/position';
import { z } from 'zod';

type Position = NonNullable<z.infer<typeof PositionListResponseSchema>['data']>['list'][number];

enum ShopType {
  RESTAURANT = "餐饮",
  LIGHT_FOOD = "轻食",
  TEA_HOUSE = "茶楼",
  TEA_COFFEE = "茶饮/咖啡",
  COFFEE_SHOP = "咖啡馆",
  HOTEL = "酒店",
}

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

interface PositionDetailProps {
  params: {
    id: string;
  };
}

const PositionDetail = ({ params }: PositionDetailProps) => {
  const router = useRouter();
  const { id } = params;
  const { openEditDialog, openDeleteDialog, openBindShopDialog } = usePositionStore();


  // 获取铺位详情
  const { data: position, isLoading: isLoadingPosition } = useQuery({
    queryKey: ["position", id],
    queryFn: async () => {
      const res = await client.GET('/api/position/{id}', {
        params: {
          path: {
            id,
          },
        },
      });
      return res.data?.data! as unknown as Position;
    },
    enabled: !!id,
  });

  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    queryKey: ["spaceList", position?.shopId],
    queryFn: async () => {
      const res = await client.POST("/api/space/list", {
        body: {
          shopId: position?.shopId as string,
        }
      });
      return res.data?.data?.list || [];
    },
    enabled: !!position?.shopId,
  });


  const handleBack = () => {
    router.push('/position');
  };

  // 加载中状态
  if (isLoadingPosition) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // 铺位不存在
  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">铺位不存在</h2>
        <p>未找到ID为 {id} 的铺位</p>
        <Button
          variant="primary"
          icon={<FiArrowLeft className="h-5 w-5"/>}
          onClick={handleBack}
        >
          返回铺位列表
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`铺位详情: ${position.position_no}`}
        subtitle={`${position.shop_no ? '已关联商家: ' + position.shop_no : '未关联商家'}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5"/>}
              onClick={handleBack}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5"/>}
              onClick={() => openEditDialog(position)}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5"/>}
              onClick={() => openDeleteDialog(position)}
            >
              删除
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card bg-base-100 shadow" data-cy="card-base">
          <div className="card-body">
            <h2 className="card-title">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="label">铺位编号</label>
                <div>{position.position_no}</div>
              </div>
              <div>
                <label className="label">所属小区</label>
                <div>
                  {/*<Link href={`/part/${((position as { part: PartResponseSchema }).part)?.id}`} className="link-primary">*/}
                  {/*  {((position as { part: PartResponseSchema }).part)?.name}*/}
                  {/*</Link>*/}
                </div>
              </div>
              <div>
                <label className="label">商家</label>
                <div>
                  {position.shopId ? (
                    <Link href={`/shop/${position.shopId}`} className="link-primary">
                      {position.shop_no}
                    </Link>
                  ) : (
                    '暂无'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow" data-cy="card-count">
          <div className="card-body">
            <h2 className="card-title">统计信息</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">广告位总数</div>
                <div className="stat-value">{position.total_space}</div>
              </div>
              <div className="stat">
                <div className="stat-title">已投放广告位</div>
                <div className="stat-value">{position.put_space}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 铺位基本信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">基本信息</h2>
            <div className="divider my-1"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">铺位编号</span>
                <span>{position.position_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">广告位总数</span>
                <span>{position.total_space}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">已投放广告位</span>
                <span>{position.put_space}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">价格基数</span>
                <span>¥{(position.price_base / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">认证状态</span>
                <span className="badge">{position.verified ? '已认证' : '未认证'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">展示状态</span>
                <span className={`badge ${position.displayed ? 'badge-success' : 'badge-ghost'}`}>
                  {position.displayed ? '展示中' : '已隐藏'}
                </span>
              </div>
              {!!position.type && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">铺位类型</span>
                  <span>{ShopType[position.type as keyof typeof ShopType]}</span>
                </div>
              )}
              {!!position.type_tag && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">品类标签</span>
                  <span>{String(position.type_tag)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 商家信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">商家信息</h2>
            <div className="divider my-1"></div>

            {position.shopId ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-base-content/70">商家编号</span>
                  <span>{String(position.shop_no)}</span>
                </div>
                {/* 这里可以添加更多商家信息，如果后端API返回 */}
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<FiShoppingBag className="h-5 w-5"/>}
                    onClick={() => router.push(`/shop/${position.shopId}`)}
                  >
                    查看商家详情
                  </Button>
                </div>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => alert('置为空铺功能待实现')}
                  >
                    置为空铺
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="mb-4 text-base-content/70">当前铺位未关联商家</p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FiLink className="h-5 w-5"/>}
                  onClick={() => openBindShopDialog(position)}
                >
                  关联商家
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 备注信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">备注信息</h2>
              <Button
                variant="ghost"
                size="sm"
                icon={<FiTag className="h-4 w-4"/>}
                onClick={() => alert('快速标记功能待实现')}
              >
                快速标记
              </Button>
            </div>
            <div className="divider my-1"></div>
            <div className="min-h-24">
              {position.remark ? (
                <p>{String(position.remark)}</p>
              ) : (
                <p className="text-center text-base-content/50">暂无备注信息</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 营业时间 */}
      {position.business_hours && position.business_hours.length > 0 && (
        <div className="mt-6 card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">营业时间</h2>
            <div className="divider my-1"></div>
            <div className="flex items-center justify-center">
              {/* 将数字时间转换为可读格式 */}
              {position.business_hours.map((time: number, index: number) => (
                <div key={index} className="px-4">
                  {index === 0 ? '开始时间: ' : '结束时间: '}
                  <span className="font-semibold">{formatTime(time)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 照片展示 */}
      {position.photo && position.photo.length > 0 && (
        <div className="mt-6 card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">铺位照片</h2>
            <div className="divider my-1"></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {position.photo.map((photo: string, index: number) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={photo}
                    alt={`铺位照片 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 广告位列表 */}
      {position.shopId && (
        <div className="mt-6 card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">广告位列表</h2>
            <div className="divider my-1"></div>

            {isLoadingSpaces ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : spacesData && spacesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                  <tr>
                    <th>广告位类型</th>
                    <th>数量</th>
                    <th>状态</th>
                    <th>价格因子</th>
                    <th>操作</th>
                  </tr>
                  </thead>
                  <tbody>
                  {spacesData.map((space) => (
                    <tr key={space.id}>
                      <td>{spaceTypeMap[space.type] || `${space.type}`}</td>
                      <td>{space.count}</td>
                      <td>
                          <span className={`badge ${spaceStateMap[space.state]?.badge || ''}`}>
                            {spaceStateMap[space.state!]?.label || `${space.state}`}
                          </span>
                      </td>
                      <td>×{space.price_factor}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/space/${space.id}`)}
                        >
                          详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="text-base-content/70">暂无广告位信息</p>
              </div>
            )}
          </div>
        </div>
      )}

      <PositionFormDialog mode={'edit'} />
      <DeletePositionDialog />
      <BindShopDialog />
    </>
  );
};

export default PositionDetail;
