import { z } from 'zod'

export const spaceSchema = z.object({
  id: z.string(),
  type: z.string(),
  setting: z.record(z.string(), z.any()),
  count: z.number(),
  state: z.string(),
  photo: z.array(z.string()),
  price_factor: z.number().positive().default(1.0).describe('价格因子'),
  updatedAt: z.date(),
  shopId: z.string(),
  shop: z.object({
    trademark: z.string().optional().describe('商标'),
    shop_no: z.string().optional().describe('门店号'),
  }).optional(),
})

export const spaceListSchema = z.object({
  shopId: z.string(),
})

export const spaceDetailSchema = z.object({
  id: z.string(),
})

export const spaceAddSchema = z.object({
  shopId: z.string().describe('商家ID'),
  type: z.string().describe('广告位类型，1-方桌不干胶贴 2-方桌餐垫纸 3-立牌 4-X展架 5-电视/LED屏幕 6-投影仪'),
  setting: z.record(z.string(), z.any()).describe('广告位设置'),
  count: z.number().int().positive().default(1).describe('广告位数量'),
  state: z.string().describe('状态 1-启用 2-禁用'),
  price_factor: z.number().positive().default(1.0).describe('价格因子'),
  tag: z.string().optional().describe('分类标签'),
  site: z.string().optional().describe(
    '位置，1-主客区/大堂 2-商家入口 3-入口通道 4-独立房间/包间 5-通往洗手间过道 6-洗手间 7-商家外摆区/店外公共区 8-店外墙面(非临街) 9-店外墙面(临街)'
  ),
  stability: z.string().optional().describe('稳定性，1-固定 2-半固定 3-移动 4-临时'),
  photo: z.array(z.string()).optional().describe('相册'),
  description: z.string().optional().describe('投放推介'),
  design_attention: z.string().optional().describe('设计注意事项'),
  construction_attention: z.string().optional().describe('施工注意事项'),
})

export const spaceUpdateSchema = spaceAddSchema.extend({
  id: z.string().describe('广告位ID'),
}).omit({ shopId: true });

export const spaceDeleteSchema = z.object({
  id: z.string(),
})

export const spaceUpdateStateSchema = z.object({
  id: z.string(),
  state: z.enum(['ENABLED', 'DISABLED']),
})

export type SpaceUpdateStateInput = z.infer<typeof spaceUpdateStateSchema>

export const spaceListResponseSchema = z.object({
  list: z.array(spaceSchema),
})

export const spaceResponseSchema = spaceSchema
