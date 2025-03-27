import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { DashboardShopTypeDistributionResponseSchema } from '@/lib/schema/dashboard'

/**
 * @desc: 获取商铺类型分布统计
 * @response: DashboardShopTypeDistributionResponse
 */
export async function GET() {
  try {
    // 查询商铺类型分布数据
    const distribution = await prisma.shop.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    })

    const data = distribution.map(item => ({
      type: item.type,
      count: item._count._all,
    }))

    // 验证响应数据
    const responseResult = DashboardShopTypeDistributionResponseSchema.safeParse(data)
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting shop type distribution:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 