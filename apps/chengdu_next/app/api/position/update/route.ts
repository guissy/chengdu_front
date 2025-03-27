import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionUpdateRequestSchema } from '@/lib/schema/position'

/**
 * @desc: 更新铺位
 * @body: PositionUpdateRequest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PositionUpdateRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id, no } = requestResult.data

    // 检查铺位是否存在
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    })

    if (!existingPosition) {
      return errorResponse('Position not found', 404)
    }

    // 检查铺位编号是否已被其他铺位使用
    const duplicatePosition = await prisma.position.findFirst({
      where: {
        position_no: no,
        id: { not: id },
      },
    })

    if (duplicatePosition) {
      return errorResponse('Position number already exists', 400)
    }

    // 更新铺位
    const position = await prisma.position.update({
      where: { id },
      data: { position_no: no },
    })

    return successResponse({
      id: position.id,
      position_no: position.position_no,
    })
  } catch (error) {
    console.error('Error updating position:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 