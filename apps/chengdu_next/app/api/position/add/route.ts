import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionAddRequestSchema } from '@/lib/schema/position'

/**
 * @desc: 添加新铺位
 * @body: PositionAddRequest
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求参数
    const requestResult = PositionAddRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { cbdId, partId, no } = requestResult.data

    // 检查商圈是否存在
    const cbd = await prisma.cBD.findUnique({
      where: { id: cbdId },
    })

    if (!cbd) {
      return errorResponse('CBD not found', 404)
    }

    // 检查分区是否存在
    const part = await prisma.part.findUnique({
      where: { id: partId },
    })

    if (!part) {
      return errorResponse('Part not found', 404)
    }

    // 检查铺位编号是否已存在
    const existingPosition = await prisma.position.findFirst({
      where: { position_no: no },
    })

    if (existingPosition) {
      return errorResponse('Position number already exists', 400)
    }

    // 创建铺位
    const position = await prisma.position.create({
      data: {
        position_no: no,
        partId,
        total_space: 0,
        put_space: 0,
        price_base: 0,
        verified: false,
        displayed: true,
        photo: [],
        business_hours: [],
      },
    })

    return successResponse({
      id: position.id,
      position_no: position.position_no,
    })
  } catch (error) {
    console.error('Error creating position:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
