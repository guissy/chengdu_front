import { z } from 'zod'

// 商家返回模式
export const shopResponseSchema = z.object({
  shopId: z.string(),
  shop_no: z.string().optional(),
  trademark: z.string(),
  branch: z.string().nullable(),
  total_space: z.number(),
  put_space: z.number(),
  price_base: z.number(),
  verified: z.boolean(),
  displayed: z.boolean(),
  type: z.string(),
  type_tag: z.string().nullable(),
  photo: z.array(z.string()),
  remark: z.string().nullable(),
  business_hours: z.array(z.number()),
  total_area: z.number().nullable(),
  customer_area: z.number().nullable(),
  clerk_count: z.number().nullable(),
  business_type: z.string(),
  duration: z.string(),
  sex: z.string(),
  age: z.array(z.number()),
  id_tag: z.string().nullable(),
  sign_photo: z.string().nullable(),
  contact_type: z.string()
});

// 商家列表返回模式
export const shopListResponseSchema = z.object({
  list: z.array(shopResponseSchema),
});

export const shopDetailSchema = z.object({
  id: z.number(),
})

export const shopAddSchema = z.object({
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
})

export const shopUpdateSchema = shopAddSchema.omit({ cbdId: true, partId: true, positionId: true }).extend({
  id: z.string().describe('商家ID'),
});

export const shopDeleteSchema = z.object({
  id: z.string(),
})
