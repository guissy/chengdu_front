import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { AuditLogDetailResponseSchema } from '@/lib/schema/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 查询审计日志详情
    const log = await prisma.auditLog.findUnique({
      where: { id },
    })

    if (!log) {
      return errorResponse('Audit log not found', 404)
    }

    // 验证响应数据
    const responseResult = AuditLogDetailResponseSchema.safeParse({ data: log })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(log)
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
