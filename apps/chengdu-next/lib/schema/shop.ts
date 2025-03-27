import { z } from 'zod';
import {
  ShopTypeEnum,
  BusinessTypeEnum,
  GenderEnum,
  ContactTypeEnum,
  OperationDurationEnum,
  RestDayEnum,
  PeakTimeEnum,
  SeasonEnum
} from './enums';
import {
  LocationSchema,
  BusinessHoursSchema,
  AgeRangeSchema,
  ExpenseRangeSchema
} from './base';
import { PositionSchema } from '@/lib/schema/position';
import { PartSchema } from '@/lib/schema/part';

// 商家基础信息字段
const shopBaseFields = {
  // name: z.string().describe('商家名称'),
  type: ShopTypeEnum.describe('类型'),
  type_tag: z.string().nullable().describe('品类标签'),
  business_type: BusinessTypeEnum.describe('商业类型'),
  trademark: z.string().describe('字号'),
  branch: z.string().nullable().describe('分店'),
  verified: z.boolean().default(false).describe('是否认证'),
  displayed: z.boolean().default(true).describe('是否开放'),
  price_base: z.number().describe('价格基数（单位：分）'),
} as const;

// 商家详细信息字段
const shopDetailFields = {
  duration: OperationDurationEnum.describe('经营时长'),
  consume_display: z.boolean().default(true).describe('是否展示消费数据'),
  average_expense: ExpenseRangeSchema,
  sex: GenderEnum.default('ALL').describe('性别'),
  age: AgeRangeSchema,
  id_tag: z.string().nullable().describe('身份标签'),
  total_area: z.number().nullable().describe('面积，单位(平方米)'),
  customer_area: z.number().nullable().describe('客区面积'),
  clerk_count: z.number().nullable().describe('店员人数'),
  business_hours: BusinessHoursSchema,
  rest_days: z.array(RestDayEnum).describe('休息日'),
  volume_peak: z.array(PeakTimeEnum).describe('客流高峰'),
  season: z.array(SeasonEnum).describe('季节'),
} as const;

// 商家图片字段
const shopPhotoFields = {
  sign_photo: z.string().nullable().describe('标识图片'),
  verify_photo: z.array(z.string()).describe('认证图片'),
  environment_photo: z.array(z.string()).describe('外景图片'),
  building_photo: z.array(z.string()).describe('内景图片'),
  brand_photo: z.array(z.string()).describe('品牌营销图片'),
} as const;

// 商家联系人字段
const shopContactFields = {
  contact_name: z.string().nullable().describe('联系人姓名'),
  contact_phone: z.string().nullable().describe('联系人电话'),
  contact_type: ContactTypeEnum.nullable().describe('联系人类型'),
} as const;

// 商家描述字段
const shopDescriptionFields = {
  shop_description: z.string().nullable().describe('商家简介'),
  put_description: z.string().nullable().describe('投放简介'),
  classify_tag: z.string().nullable().describe('分类标签'),
  remark: z.string().nullable().describe('备注'),
} as const;

// 商家店铺及小区
const shopPosition = {
  position: PositionSchema.pick({
    id: true,
    position_no: true,
    put_space: true,
    total_space: true,
    photo: true
  }).optional(),
  part: PartSchema.pick({
    id: true,
    name: true,
  }).optional(),
}

// 商家模型
export const ShopResponseSchema = z.object({
  id: z.string(),
  shop_no: z.string().describe('商家编号'),
  cbdId: z.string().describe('商圈id'),
  partId: z.string().describe('分区id'),
  location: LocationSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  ...shopBaseFields,
  ...shopDetailFields,
  ...shopPhotoFields,
  ...shopContactFields,
  ...shopDescriptionFields,
  ...shopPosition
});

// 商家列表请求
export const ShopListRequestSchema = z.object({
  cbdId: z.string().optional().describe('商圈ID'),
  keyword: z.string().optional().describe('搜索关键词'),
});

// 商家列表响应
export const ShopListResponseSchema = z.object({
  data: z.object({
    list: z.array(ShopResponseSchema),
  }),
});

// 新增商家请求
export const ShopAddRequestSchema = z.object({
  cbdId: z.string().describe('商圈ID'),
  partId: z.string().describe('分区ID'),
  positionId: z.string().describe('铺位ID').optional(),
  type: z.string().describe('类型，1-餐饮 2-轻食 3-茶楼 4-茶饮/咖啡 5-咖啡馆 6-酒店'),
  type_tag: z.string().optional().describe('品类标签'),
  business_type: z.string().describe('商业类型，1-独立自营店 2-连锁自营店 3-连锁加盟店'),
  trademark: z.string().min(1).describe('字号'),
  branch: z.string().optional().describe('分店'),
  location: z.tuple([z.number(), z.number()]).describe('坐标，经纬度'),
  verified: z.boolean().default(false).describe('是否认证'),
  duration: z.string().describe('经营时长，1-一年内新店 2-1~2年 3-2~5年 4-五年以上'),
  consume_display: z.boolean().default(true).describe('是否展示消费数据'),
  average_expense: z.tuple([z.number().int(), z.number().int()]).describe('人均消费最低到最高值，单位(分)'),
  sex: z.string().describe('性别，1-不限 2-男 3-女'),
  age: z.tuple([z.number().int(), z.number().int()]).describe('年龄段最低到最高值'),
  id_tag: z.string().optional().describe('身份标签'),
  sign_photo: z.string().optional().describe('标识图片'),
  verify_photo: z.array(z.string()).optional().describe('认证图片'),
  environment_photo: z.array(z.string()).optional().describe('外景图片'),
  building_photo: z.array(z.string()).optional().describe('内景图片'),
  brand_photo: z.array(z.string()).optional().describe('品牌营销图片'),
  contact_name: z.string().optional().describe('联系人姓名'),
  contact_phone: z.string().optional().describe('联系人电话'),
  contact_type: z.string().optional().describe('联系人类型，1-老板 2-店长 3-店员 4-总店管理人员'),
  total_area: z.number().optional().describe('面积，单位(平方米)'),
  customer_area: z.number().optional().describe('客区面积'),
  clerk_count: z.number().optional().describe('店员人数'),
  business_hours: z.tuple([z.number().int(), z.number().int()]).describe('营业时间'),
  rest_days: z.array(z.string()).describe('休息日，1-周一 2-周二 3-周三 4-周四 5-周五 6-周六 7-周日 8-按需'),
  volume_peak: z.array(z.string()).describe('客流高峰，1-早餐 2-午餐 3-晚餐 4-宵夜 5-上午 6-下午 7-晚上 8-深夜'),
  season: z.array(z.string()).describe('1-春 2-夏 3-秋 4-冬 5-节假日 6-工作日 7-非工作日'),
  shop_description: z.string().optional().describe('商家简介'),
  put_description: z.string().optional().describe('投放简介'),
  displayed: z.boolean().default(true).describe('是否开放'),
  price_base: z.number().int().describe('价格基数（单位：分）'),
  classify_tag: z.string().optional().describe('分类标签'),
  remark: z.string().optional().describe('备注'),
});

// 更新商家请求
export const ShopUpdateRequestSchema = z.object({
  // name: z.string().optional().describe('商家名称'),
  contact_name: z.string().optional().describe('联系人姓名'),
  contact_phone: z.string().optional().describe('联系人电话'),
  business_type: z.string().optional().describe('经营类型'),
  trademark: z.string().optional().describe('商标'),
  branch: z.string().optional().describe('分店名'),
  average_expense: ExpenseRangeSchema.optional().describe('人均消费'),
  total_area: z.number().optional().describe('总面积'),
  customer_area: z.number().optional().describe('客区面积'),
  clerk_count: z.number().optional().describe('员工数量'),
  business_hours: z.tuple([z.number(), z.number()]).optional().describe('营业时间'),
  rest_days: z.array(z.string()).optional().describe('休息日'),
  shop_description: z.string().optional().describe('商家描述'),
});
