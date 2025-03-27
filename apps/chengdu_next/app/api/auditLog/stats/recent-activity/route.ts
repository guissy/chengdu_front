import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { AuditLogRecentActivityStatsResponseSchema } from '@/lib/schema/audit'

/**
 * @desc: 获取最近审计日志活动统计
 * @query: { days?: number }
 * @response: AuditLogRecentActivityStats
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = Number(searchParams.get('days')) || 7

    // 计算开始日期
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // 查询近期活动数据
    const logs = await prisma.auditLog.findMany({
      where: {
        operationTime: {
          gte: startDate,
        },
      },
      orderBy: {
        operationTime: 'asc',
      },
    })

    // 按日期分组统计
    const stats = new Map<string, number>()
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      stats.set(date.toISOString().split('T')[0], 0)
    }

    logs.forEach(log => {
      const date = log.operationTime.toISOString().split('T')[0]
      stats.set(date, (stats.get(date) || 0) + 1)
    })

    // 转换数据格式
    const data = Array.from(stats.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // 验证响应数据
    const responseResult = AuditLogRecentActivityStatsResponseSchema.safeParse({ data })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting recent activity stats:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 