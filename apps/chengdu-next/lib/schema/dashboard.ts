import { z } from 'zod'
import { BaseResponseSchema } from './base'

// 仪表盘统计响应
export const DashboardStatsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    totalShops: z.number().describe('商家总数'),
    totalSpaces: z.number().describe('广告位总数'),
    totalPartitions: z.number().describe('分区总数'),
    recentActivity: z.object({
      shops: z.number().describe('新增商家数'),
      spaces: z.number().describe('新增广告位数'),
      partitions: z.number().describe('新增分区数'),
    }).describe('近期活动统计'),
  }),
})

// 最近添加的商家请求
export const DashboardRecentShopsRequestSchema = z.object({
  limit: z.number().default(5).describe('返回数量'),
})

// 最近添加的商家响应
export const DashboardRecentShopsResponseSchema = z.array(z.object({
      id: z.string(),
      shop_no: z.string(),
      type: z.string(),
      createdAt: z.date(),
      trademark: z.string(),
  }));

// 商圈分布统计响应
export const DashboardCbdDistributionResponseSchema = z.array(z.object({
    id: z.string().describe('商圈ID'),
    name: z.string().describe('商圈名称'),
    shopCount: z.number().describe('数量'),
  }));

// 商家类型分布统计响应
export const DashboardShopTypeDistributionResponseSchema = z.array(z.object({
  type: z.string().describe('商家类型'),
  count: z.number().describe('数量'),
}))
