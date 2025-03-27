import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionDeleteRequestSchema } from '@/lib/schema/position'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PositionDeleteRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id } = requestResult.data

    // 检查铺位是否存在
    const position = await prisma.position.findUnique({
      where: { id },
    })

    if (!position) {
      return errorResponse('Position not found', 404)
    }

    // 删除铺位
    await prisma.position.delete({
      where: { id },
    })

    return successResponse({
      message: 'Position deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting position:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 