import { z } from 'zod';
import { BaseResponseSchema } from './base';
import { ShopTypeEnum } from './enums';
import { BusinessHoursSchema } from './base';

// 铺位基础字段
const positionBaseFields = {
  id: z.string().describe('铺位ID'),
  position_no: z.string().describe('铺位编号'),
  total_space: z.number().default(0).describe('广告位总数'),
  put_space: z.number().default(0).describe('已投放广告位总数'),
  price_base: z.number().describe('价格基数（单位：分）'),
  verified: z.boolean().default(false).describe('是否认证'),
  displayed: z.boolean().default(true).describe('是否展示'),
  type: ShopTypeEnum.nullable().describe('类型'),
  type_tag: z.string().nullable().describe('品类标签'),
  photo: z.array(z.string()).describe('图片'),
  remark: z.string().nullable().describe('备注'),
  business_hours: BusinessHoursSchema,
} as const;

// 铺位模型
export const PositionSchema = z.object({
  partId: z.string().describe('分区id'),
  shopId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ...positionBaseFields,
});

// 铺位列表请求
export const PositionListRequestSchema = z.object({
  partId: z.string().optional().describe('分区ID'),
});

// 铺位列表响应
export const PositionListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      shopId: z.string().nullable(),
      shop_no: z.string().nullable(),
      ...positionBaseFields,
    })),
  }).optional(),
});

// 铺位新增请求
export const PositionAddRequestSchema = z.object({
  cbdId: z.string().describe('商圈ID'),
  partId: z.string().describe('分区ID'),
  no: z.string().describe('铺位编号'),
});

// 铺位更新请求
export const PositionUpdateRequestSchema = z.object({
  id: z.string().describe('铺位ID'),
  no: z.string().describe('铺位编号'),
});

// 铺位绑定商家请求
export const PositionBindShopRequestSchema = z.object({
  id: z.string().describe('铺位ID'),
  shopId: z.string().describe('商家ID'),
});

// 铺位解绑商家请求
export const PositionUnbindShopRequestSchema = z.object({
  id: z.string().describe('铺位ID'),
});

// 铺位标记请求
export const PositionMarkRequestSchema = z.object({
  id: z.string().describe('铺位ID'),
  remark: z.string().describe('标记内容'),
}); 

// 铺位删除
export const PositionDeleteRequestSchema = z.object({
  id: z.string().describe('铺位ID'),
});