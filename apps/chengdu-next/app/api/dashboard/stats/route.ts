import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { DashboardStatsResponseSchema } from '@/lib/schema/dashboard'
import { AuditLog } from '@prisma/client'

/**
 * @desc: 获取仪表盘统计数据
 * @response: DashboardStatsResponse
 */
export async function GET() {
  try {
    // 获取总数统计
    const [shopCount, spaceCount, recentActivities] = await Promise.all([
      prisma.shop.count(),
      prisma.space.count(),
      prisma.auditLog.findMany({
        where: {
          operationTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
          },
        },
        orderBy: {
          operationTime: 'desc',
        },
        take: 10,
      }),
    ])

    const data = {
      totalShops: shopCount,
      totalSpaces: spaceCount,
      totalPartitions: 0, // 由于没有 partition 表，暂时返回 0
      recentActivities: recentActivities.map((activity: AuditLog) => ({
        id: activity.id,
        operationType: activity.operationType,
        targetType: activity.targetType,
        targetName: activity.targetName,
        operatorName: activity.operatorName,
        operationTime: activity.operationTime,
      })),
    }

    // 验证响应数据
    const responseResult = DashboardStatsResponseSchema.safeParse(data)
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 