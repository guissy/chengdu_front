import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoMdImage } from 'react-icons/io';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getSpaceByIdOptions, getSpaceByIdQueryKey, postSpaceUpdateMutation } from '@/api/@tanstack/react-query.gen.ts';
import Button from '@/components/ui/button.tsx';
import PageHeader from '@/components/ui/page-header.tsx';
import { useSpaceStore } from '@/features/space/space-store';
import SpaceFormDialog from '@/features/space/components/space-form-dialog';
import DeleteSpaceDialog from '@/features/space/components/delete-space-dialog';

// Enums from schema
enum SpaceType {
  TABLE_STICKER = "TABLE_STICKER",
  TABLE_PLACEMAT = "TABLE_PLACEMAT",
  STAND = "STAND",
  X_BANNER = "X_BANNER",
  TV_LED = "TV_LED",
  PROJECTOR = "PROJECTOR",
}

enum SpaceState {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

enum SpaceSite {
  MAIN_AREA = "MAIN_AREA",
  SHOP_ENTRANCE = "SHOP_ENTRANCE",
  ENTRANCE_PASSAGE = "ENTRANCE_PASSAGE",
  PRIVATE_ROOM = "PRIVATE_ROOM",
  TOILET_PASSAGE = "TOILET_PASSAGE",
  TOILET = "TOILET",
  OUTDOOR_AREA = "OUTDOOR_AREA",
  OUTSIDE_WALL = "OUTSIDE_WALL",
  STREET_WALL = "STREET_WALL",
}

enum SpaceStability {
  FIXED = "FIXED",
  SEMI_FIXED = "SEMI_FIXED",
  MOVABLE = "MOVABLE",
  TEMPORARY = "TEMPORARY",
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
  [SpaceSite.SHOP_ENTRANCE]: '商家入口',
  [SpaceSite.ENTRANCE_PASSAGE]: '入口通道',
  [SpaceSite.PRIVATE_ROOM]: '独立房间/包间',
  [SpaceSite.TOILET_PASSAGE]: '通往洗手间过道',
  [SpaceSite.TOILET]: '洗手间',
  [SpaceSite.OUTDOOR_AREA]: '商家外摆区/店外公共区',
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
  const { openEditDialog, openDeleteDialog } = useSpaceStore();

  const { data: space, isLoading, error } = useQuery({
    ...getSpaceByIdOptions({
      path: { id: id! },
    }),
    select: (data) => data.data,
    enabled: !!id,
  });

  const { mutate: updateSpaceState } = useMutation({
    ...postSpaceUpdateMutation(),
  })
  const queryClient = useQueryClient();

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
      // await axios.patch(`/api/space/${id}`, { state: newState });
      await updateSpaceState({
        body: {
          ...space,
          id: space.id,
          state: newState,
        }
      });
      queryClient.invalidateQueries({
        queryKey: getSpaceByIdQueryKey({
          path: {
            id: space.id,
          }
        }),
      });
      toast.success(`广告位状态已更新为${spaceStateLabels[newState]}`);
    } catch (err) {
      toast.error('更新状态失败');
      console.error(err);
    }
  };

  return (
    <>
      {/* Header with back button */}
      {/*<div className="flex items-center mb-6">*/}
      {/*  <button*/}
      {/*    className="btn btn-ghost btn-circle mr-2"*/}
      {/*    onClick={() => navigate(-1)}*/}
      {/*  >*/}
      {/*    <FiArrowLeft className="w-5 h-5" />*/}
      {/*  </button>*/}
      {/*  <h1 className="text-2xl font-bold">广告位详情</h1>*/}
      {/*</div>*/}
      <PageHeader
        title={`广告位详情`}
        // subtitle={`广告位详情`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(-1)}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5" />}
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(space);
              }}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5" />}
              onClick={() => {
                openDeleteDialog(space)
              }}
            >
              删除
            </Button>
          </div>
        }
      />
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
              <span className="text-sm text-gray-500 w-24">商家编号:</span>
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
                  查看商家详情
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
      <SpaceFormDialog mode="edit" />
      <DeleteSpaceDialog />
    </>
  );
};

export default SpaceDetail;
