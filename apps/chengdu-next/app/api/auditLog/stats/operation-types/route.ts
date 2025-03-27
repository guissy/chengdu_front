import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { AuditLogOperationTypeStatsResponseSchema } from '@/lib/schema/audit'

export async function GET() {
  try {
    // 按操作类型分组统计
    const stats = await prisma.auditLog.groupBy({
      by: ['operationType'],
      _count: true,
    })

    // 转换数据格式
    const data = stats.map(item => ({
      operationType: item.operationType,
      count: item._count,
    }))

    // 验证响应数据
    const responseResult = AuditLogOperationTypeStatsResponseSchema.safeParse({ data })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting operation type stats:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 