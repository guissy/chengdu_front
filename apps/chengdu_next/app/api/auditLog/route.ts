import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { AuditLogListRequestSchema, AuditLogListResponseSchema } from '@/lib/schema/audit'
import { OperationType, OperationTarget } from '@prisma/client'

/**
 * @desc: 获取审计日志列表
 * @query: AuditLogListRequest
 * @response: AuditLogListResponse
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      operationType: searchParams.get('operationType') || undefined,
      targetType: searchParams.get('targetType') || undefined,
      targetId: searchParams.get('targetId') || undefined,
      operator: searchParams.get('operator') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    // 验证请求参数
    const requestResult = AuditLogListRequestSchema.safeParse(params)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { page = 1, pageSize = 10, operationType, targetType, targetId, operator, startDate, endDate } = requestResult.data

    // 构建查询条件
    const where = {
      ...(operationType ? { operationType: operationType as OperationType } : {}),
      ...(targetType ? { targetType: targetType as OperationTarget } : {}),
      ...(targetId ? { targetId } : {}),
      ...(operator ? { operatorId: operator } : {}),
      ...(startDate || endDate ? {
        operationTime: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        },
      } : {}),
    }

    // 查询总数
    const total = await prisma.auditLog.count({ where })

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize)

    // 查询列表数据
    const logs = await prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        operationTime: 'desc',
      },
    })

    const response = {
      list: logs,
      total,
      page,
      pageSize,
      totalPages,
    }

    // 验证响应数据
    const responseResult = AuditLogListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
