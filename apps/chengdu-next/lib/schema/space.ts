import { z } from 'zod';
import { SpaceTypeEnum, SpaceStateEnum, SpaceSiteEnum, SpaceStabilityEnum } from './enums';

// 广告位模型
export const SpaceResponseSchema = z.object({
  id: z.string(),
  shopId: z.string().describe('商家id'),
  type: SpaceTypeEnum.describe('广告位类型'),
  setting: z.record(z.unknown()).describe('广告位设置'),
  count: z.number().default(1).describe('广告位数量'),
  state: SpaceStateEnum.default('ENABLED').describe('状态'),
  price_factor: z.number().default(1.0).describe('价格因子'),
  tag: z.string().nullable().describe('分类标签'),
  site: SpaceSiteEnum.nullable().describe('位置'),
  stability: SpaceStabilityEnum.nullable().describe('稳定性'),
  photo: z.array(z.string()).describe('相册'),
  description: z.string().nullable().describe('投放推介'),
  design_attention: z.string().nullable().describe('设计注意事项'),
  construction_attention: z.string().nullable().describe('施工注意事项'),
  createdAt: z.date(),
  updatedAt: z.date(),
  shop: z.object({
    id: z.string(),
    shop_no: z.string(),
    trademark: z.string(),
    branch: z.string(),
    type_tag: z.string(),
  }).optional(),
});

// 广告位列表请求
export const SpaceListRequestSchema = z.object({
  shopId: z.string().optional().describe('商家ID'),
  type: z.string().optional().describe('广告位类型'),
  state: z.string().optional().describe('状态'),
  site: z.string().optional().describe('位置'),
  stability: z.string().optional().describe('稳定性'),
});

// 广告位列表响应
export const SpaceListResponseSchema = z.object({
  data: z.object({
    list: z.array(SpaceResponseSchema),
  }),
});

// 广告位设置
export const SpaceSettingSchema = z.object({
  size: z.object({
    width: z.number().describe('宽度（毫米）'),
    height: z.number().describe('高度（毫米）'),
  }).optional(),
  material: z.string().optional().describe('材质'),
  installation: z.string().optional().describe('安装方式'),
  duration: z.number().optional().describe('展示时长（秒）'),
  frequency: z.number().optional().describe('播放频率（次/小时）'),
});

// 广告位新增请求
export const SpaceAddRequestSchema = z.object({
  shopId: z.string().describe('商家ID'),
  type: z.string().describe('广告位类型'),
  setting: SpaceSettingSchema.describe('广告位设置'),
  count: z.number().optional().describe('广告位数量'),
  state: z.string().optional().describe('状态'),
  price_factor: z.number().optional().describe('价格因子'),
  tag: z.string().optional().describe('分类标签'),
  site: z.string().optional().describe('位置'),
  stability: z.string().optional().describe('稳定性'),
  photo: z.array(z.string()).optional().describe('相册'),
  description: z.string().optional().describe('投放推介'),
  design_attention: z.string().optional().describe('设计注意事项'),
  construction_attention: z.string().optional().describe('施工注意事项'),
});

// 广告位更新请求
export const SpaceUpdateRequestSchema = z.object({
  type: z.string().optional().describe('广告位类型'),
  setting: SpaceSettingSchema.optional().describe('广告位设置'),
  count: z.number().optional().describe('广告位数量'),
  state: z.string().optional().describe('状态'),
  price_factor: z.number().optional().describe('价格因子'),
  tag: z.string().optional().describe('分类标签'),
  site: z.string().optional().describe('位置'),
  stability: z.string().optional().describe('稳定性'),
  photo: z.array(z.string()).optional().describe('相册'),
  description: z.string().optional().describe('投放推介'),
  design_attention: z.string().optional().describe('设计注意事项'),
  construction_attention: z.string().optional().describe('施工注意事项'),
});

// 广告位状态更新请求
export const SpaceStateUpdateRequestSchema = z.object({
  id: z.string().describe('广告位ID'),
  state: z.string().describe('状态'),
});

// 广告位批量状态更新请求
export const SpaceBatchStateUpdateRequestSchema = z.object({
  ids: z.array(z.string()).describe('广告位ID列表'),
  state: z.string().describe('状态'),
});

// 广告位统计请求
export const SpaceStatsRequestSchema = z.object({
  shopId: z.string().optional().describe('商家ID'),
  type: z.string().optional().describe('广告位类型'),
  site: z.string().optional().describe('位置'),
});

// 广告位统计响应
export const SpaceStatsResponseSchema = z.object({
  data: z.object({
    total: z.number().describe('总数'),
    byState: z.record(z.number()).describe('按状态统计'),
    byType: z.record(z.number()).describe('按类型统计'),
    bySite: z.record(z.number()).describe('按位置统计'),
    byStability: z.record(z.number()).describe('按稳定性统计'),
  }),
});

// 广告位搜索请求
export const SpaceSearchRequestSchema = z.object({
  keyword: z.string().describe('搜索关键词'),
  shopId: z.string().optional().describe('商家ID'),
  type: z.string().optional().describe('广告位类型'),
  state: z.string().optional().describe('状态'),
  site: z.string().optional().describe('位置'),
  stability: z.string().optional().describe('稳定性'),
  page: z.number().default(1).describe('页码'),
  pageSize: z.number().default(20).describe('每页数量'),
});

// 广告位搜索响应
export const SpaceSearchResponseSchema = z.object({
  data: z.object({
    list: z.array(z.object({
      id: z.string(),
      type: z.string(),
      count: z.number(),
      state: z.string(),
      price_factor: z.number(),
      tag: z.string().nullable(),
      site: z.string().nullable(),
      stability: z.string().nullable(),
      photo: z.array(z.string()),
      description: z.string().nullable(),
      design_attention: z.string().nullable(),
      construction_attention: z.string().nullable(),
      shop: z.object({
        id: z.string(),
        shop_no: z.string(),
        // name: z.string(),
      }),
    })),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }),
});

// 广告位导出请求
export const SpaceExportRequestSchema = z.object({
  shopId: z.string().optional().describe('商家ID'),
  type: z.string().optional().describe('广告位类型'),
  state: z.string().optional().describe('状态'),
  site: z.string().optional().describe('位置'),
  stability: z.string().optional().describe('稳定性'),
  format: z.enum(['csv', 'excel']).default('excel').describe('导出格式'),
});

// 广告位导入请求
export const SpaceImportRequestSchema = z.object({
  file: z.any().describe('文件数据'),
  format: z.enum(['csv', 'excel']).default('excel').describe('文件格式'),
  shopId: z.string().describe('商家ID'),
});

// 广告位导入响应
export const SpaceImportResponseSchema = z.object({
  data: z.object({
    total: z.number().describe('总数'),
    success: z.number().describe('成功数'),
    failed: z.number().describe('失败数'),
    errors: z.array(z.object({
      row: z.number().describe('行号'),
      message: z.string().describe('错误信息'),
    })).describe('错误详情'),
  }),
});

// 广告位图片上传请求
export const SpacePhotoUploadRequestSchema = z.object({
  id: z.string().describe('广告位ID'),
  photos: z.array(z.any()).describe('图片文件列表'),
});

// 广告位图片上传响应
export const SpacePhotoUploadResponseSchema = z.object({
  data: z.object({
    id: z.string().describe('广告位ID'),
    photo: z.array(z.string()).describe('图片URL列表'),
  }),
});

// 广告位批量删除请求
export const SpaceBatchDeleteRequestSchema = z.object({
  ids: z.array(z.string()).describe('广告位ID列表'),
});

// 广告位批量删除响应
export const SpaceBatchDeleteResponseSchema = z.object({
  data: z.object({
    total: z.number().describe('总数'),
    success: z.number().describe('成功数'),
    failed: z.number().describe('失败数'),
    errors: z.array(z.object({
      id: z.string().describe('广告位ID'),
      message: z.string().describe('错误信息'),
    })).describe('错误详情'),
  }),
});

// 广告位删除请求
export const SpaceDeleteRequestSchema = z.object({
  id: z.string().describe('广告位ID'),
});
