import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionMarkRequestSchema } from '@/lib/schema/position'

/**
 * @desc: 标记铺位
 * @body: PositionMarkRequest
 * @response: { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PositionMarkRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id, remark } = requestResult.data

    // 检查铺位是否存在
    const position = await prisma.position.findUnique({
      where: { id },
    })

    if (!position) {
      return errorResponse('Position not found', 404)
    }

    // 更新标记
    await prisma.position.update({
      where: { id },
      data: { remark },
    })

    return successResponse({
      message: 'Position marked successfully',
    })
  } catch (error) {
    console.error('Error marking position:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 