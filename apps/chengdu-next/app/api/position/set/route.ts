import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionUnbindShopRequestSchema } from '@/lib/schema/position'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PositionUnbindShopRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id } = requestResult.data

    // 检查铺位是否存在
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    })

    if (!existingPosition) {
      return errorResponse('Position not found', 404)
    }

    // 设置为空铺
    const position = await prisma.position.update({
      where: { id },
      data: { 
        shopId: null,
        total_space: 0,
        put_space: 0,
      },
    })

    return successResponse({
      id: position.id,
      position_no: position.position_no,
    })
  } catch (error) {
    console.error('Error setting position:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 