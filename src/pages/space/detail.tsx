import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IoMdImage } from 'react-icons/io';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

// Enums from schema
enum SpaceType {
  TABLE_STICKER = "1",
  TABLE_PLACEMAT = "2",
  STAND = "3",
  X_BANNER = "4",
  TV_LED = "5",
  PROJECTOR = "6",
}

enum SpaceState {
  ENABLED = "1",
  DISABLED = "2",
}

enum SpaceSite {
  MAIN_AREA = "1",
  SHOP_ENTRANCE = "2",
  ENTRANCE_PASSAGE = "3",
  PRIVATE_ROOM = "4",
  TOILET_PASSAGE = "5",
  TOILET = "6",
  OUTDOOR_AREA = "7",
  OUTSIDE_WALL = "8",
  STREET_WALL = "9",
}

enum SpaceStability {
  FIXED = "1",
  SEMI_FIXED = "2",
  MOVABLE = "3",
  TEMPORARY = "4",
}

// Type definitions
interface Space {
  id: string;
  shopId: string;
  type: SpaceType;
  setting: Record<string, any>;
  count: number;
  state: SpaceState;
  priceFactor: number;
  tag?: string;
  site?: SpaceSite;
  stability?: SpaceStability;
  photo: string[];
  description?: string;
  design_attention?: string;
  construction_attention?: string;
  createdAt: string;
  updatedAt: string;
  shop: {
    id: string;
    trademark: string;
    branch?: string;
    type_tag?: string;
    shop_no: string;
  };
}

// Helper functions for displaying enum values
const spaceTypeLabels: Record<SpaceType, string> = {
  [SpaceType.TABLE_STICKER]: '方桌不干胶贴',
  [SpaceType.TABLE_PLACEMAT]: '方桌餐垫纸',
  [SpaceType.STAND]: '立牌',
  [SpaceType.X_BANNER]: 'X展架',
  [SpaceType.TV_LED]: '电视/LED屏幕',
  [SpaceType.PROJECTOR]: '投影仪',
};

const spaceStateLabels: Record<SpaceState, string> = {
  [SpaceState.ENABLED]: '启用',
  [SpaceState.DISABLED]: '禁用',
};

const spaceSiteLabels: Record<SpaceSite, string> = {
  [SpaceSite.MAIN_AREA]: '主客区/大堂',
  [SpaceSite.SHOP_ENTRANCE]: '店铺入口',
  [SpaceSite.ENTRANCE_PASSAGE]: '入口通道',
  [SpaceSite.PRIVATE_ROOM]: '独立房间/包间',
  [SpaceSite.TOILET_PASSAGE]: '通往洗手间过道',
  [SpaceSite.TOILET]: '洗手间',
  [SpaceSite.OUTDOOR_AREA]: '店铺外摆区/店外公共区',
  [SpaceSite.OUTSIDE_WALL]: '店外墙面(非临街)',
  [SpaceSite.STREET_WALL]: '店外墙面(临街)',
};

const spaceStabilityLabels: Record<SpaceStability, string> = {
  [SpaceStability.FIXED]: '固定',
  [SpaceStability.SEMI_FIXED]: '半固定',
  [SpaceStability.MOVABLE]: '移动',
  [SpaceStability.TEMPORARY]: '临时',
};

const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { data: space, isLoading, error } = useQuery({
    queryKey: ['space', id],
    queryFn: async () => {
      const response = await axios.get(`/api/space/${id}`);
      return response.data as Space;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-error text-2xl mb-4">无法加载广告位信息</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </div>
    );
  }

  // Function to handle state change
  const handleStateChange = async (newState: SpaceState) => {
    try {
      await axios.patch(`/api/space/${id}`, { state: newState });
      toast.success(`广告位状态已更新为${spaceStateLabels[newState]}`);
    } catch (err) {
      toast.error('更新状态失败');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          className="btn btn-ghost btn-circle mr-2"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">广告位详情</h1>
      </div>

      {/* Shop info card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title flex justify-between">
            <span>{space.shop?.trademark}{space.shop?.branch ? ` (${space.shop?.branch})` : ''}</span>
            <div className={`badge ${space.state === SpaceState.ENABLED ? 'badge-success' : 'badge-error'}`}>
              {spaceStateLabels[space.state]}
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 w-24">店铺编号:</span>
              <span>{space.shop?.shop_no}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 w-24">品类标签:</span>
              <span>{space.shop?.type_tag || '无'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content in two columns for desktop, one column for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Space details */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">广告位信息</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-24">广告位类型:</span>
                  <span>{spaceTypeLabels[space.type]}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-24">数量:</span>
                  <span>{space.count}个</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-24">价格因子:</span>
                  <span>{space.priceFactor}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-24">分类标签:</span>
                  <span>{space.tag || '无'}</span>
                </div>
                {space.site && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-24">位置:</span>
                    <span>{spaceSiteLabels[space.site]}</span>
                  </div>
                )}
                {space.stability && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-24">稳定性:</span>
                    <span>{spaceStabilityLabels[space.stability]}</span>
                  </div>
                )}
              </div>

              {/* Space settings */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">广告位设置</h3>
                <div className="bg-base-200 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(space.setting, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Additional information card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">投放信息</h2>

              {space.description && (
                <div className="mt-4">
                  <h3 className="text-md font-medium">投放推介</h3>
                  <p className="mt-1 text-gray-600">{space.description}</p>
                </div>
              )}

              {space.design_attention && (
                <div className="mt-4">
                  <h3 className="text-md font-medium">设计注意事项</h3>
                  <p className="mt-1 text-gray-600">{space.design_attention}</p>
                </div>
              )}

              {space.construction_attention && (
                <div className="mt-4">
                  <h3 className="text-md font-medium">施工注意事项</h3>
                  <p className="mt-1 text-gray-600">{space.construction_attention}</p>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-md font-medium">更新时间</h3>
                <p className="mt-1 text-gray-600">{new Date(space.updatedAt).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Photos and actions */}
        <div className="lg:col-span-1">
          {/* Photos card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">相册 ({space.photo?.length})</h2>

              {space.photo?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {space.photo?.map((url, index) => (
                    <div
                      key={index}
                      className="relative cursor-pointer rounded-lg overflow-hidden aspect-square"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`广告位照片 ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 bg-base-200 rounded-lg mt-2">
                  <IoMdImage className="text-4xl text-gray-400" />
                  <p className="text-gray-500 mt-2">暂无照片</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">操作</h2>

              <div className="space-y-4 mt-4">
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => navigate(`/space/${id}/edit`)}
                >
                  编辑广告位
                </button>

                {space.state === SpaceState.ENABLED ? (
                  <button
                    className="btn btn-error btn-block"
                    onClick={() => handleStateChange(SpaceState.DISABLED)}
                  >
                    禁用广告位
                  </button>
                ) : (
                  <button
                    className="btn btn-success btn-block"
                    onClick={() => handleStateChange(SpaceState.ENABLED)}
                  >
                    启用广告位
                  </button>
                )}

                <button
                  className="btn btn-outline btn-block"
                  onClick={() => navigate(`/shop/${space.shopId}`)}
                >
                  查看店铺详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center" onClick={() => setSelectedImageIndex(null)}>
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={space.photo[selectedImageIndex]}
              alt={`广告位照片 ${selectedImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute bottom-10 left-0 right-0 text-center text-white">
              {selectedImageIndex + 1} / {space.photo?.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceDetail;
