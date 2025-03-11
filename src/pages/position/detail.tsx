import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiTrash2, FiShoppingBag, FiTag, FiLink } from 'react-icons/fi';
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import { postPositionListOptions, postSpaceListOptions } from '@/api/@tanstack/react-query.gen.ts';
import { Position } from '@/api';

// 假设这是广告位类型
// interface Space {
//   id: string;
//   type: number;
//   count: number;
//   state: number;
//   priceFactor: number;
//   photo: string[];
// }

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

const PositionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position | null>(null);

  // 获取铺位详情
  const { data: positionData, isLoading: isLoadingPosition } = useQuery({
    ...postPositionListOptions({}),
    select: (data) => {
      const foundPosition = data?.data?.list?.find(p => p.positionId === id);
      if (!foundPosition) throw new Error('铺位不存在');
      return foundPosition;
    },
    enabled: !!id,
  });

  const { data, isLoading: isLoadingSpaces } = useQuery({
    ...postSpaceListOptions({
      body: {
        shopId: positionData?.shopId as string,
      }
    }),
    enabled: !!positionData?.shopId,
  });
  const spacesData = useMemo(() => data?.data?.list, [data])


  // 更新本地state
  useEffect(() => {
    if (positionData) {
      setPosition(positionData);
    }
  }, [positionData]);

  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/position');
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
        subtitle={`${position.shop_no ? '已关联店铺: ' + position.shop_no : '未关联店铺'}`}
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
              onClick={() => alert('编辑铺位功能待实现')}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5"/>}
              onClick={() => alert('删除铺位功能待实现')}
            >
              删除
            </Button>
          </div>
        }
      />

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

        {/* 店铺信息 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">店铺信息</h2>
            <div className="divider my-1"></div>

            {position.shopId ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-base-content/70">店铺编号</span>
                  <span>{String(position.shop_no)}</span>
                </div>
                {/* 这里可以添加更多店铺信息，如果后端API返回 */}
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<FiShoppingBag className="h-5 w-5"/>}
                    onClick={() => navigate(`/shop/${position.shopId}`)}
                  >
                    查看店铺详情
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
                <p className="mb-4 text-base-content/70">当前铺位未关联店铺</p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FiLink className="h-5 w-5"/>}
                  onClick={() => alert('关联店铺功能待实现')}
                >
                  关联店铺
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
              {position.business_hours.map((time: number, index: number) => {
                // 假设时间格式为HHMMSS
                const hours = Math.floor(time / 10000);
                const minutes = Math.floor((time % 10000) / 100);

                const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                return (
                  <div key={index} className="px-4">
                    {index === 0 ? '开始时间: ' : '结束时间: '}
                    <span className="font-semibold">{formattedTime}</span>
                  </div>
                );
              })}
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
                      <td>×{space.priceFactor}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/space/${space.id}`)}
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
    </>
  );
};

export default PositionDetailPage;
