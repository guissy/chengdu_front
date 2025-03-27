import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { DashboardCbdDistributionResponseSchema } from '@/lib/schema/dashboard'

/**
 * @desc: 获取商圈分布统计
 * @response: DashboardCbdDistributionResponse
 */
export async function GET() {
  try {
    // 查询商圈分布数据
    const distribution = await prisma.shop.groupBy({
      by: ['cbdId'],
      _count: {
        _all: true,
      },
    })

    // 获取商圈信息
    const cbdIds = distribution.map(item => item.cbdId)
    const cbds = await prisma.cBD.findMany({
      where: {
        id: {
          in: cbdIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    // 合并数据
    const data = cbds.map((cbd: { id: string; name: string }) => ({
        id: cbd.id,
        name: cbd.name,
        shopCount: distribution.find(item => item.cbdId === cbd.id)?._count._all || 0,
      }));

    // 验证响应数据
    const responseResult = DashboardCbdDistributionResponseSchema.safeParse(data)
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting CBD distribution:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 