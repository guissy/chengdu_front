import { prisma } from '@/app/lib/prisma'
import { positionAddSchema } from '@/app/lib/schemas/position'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Position } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = positionAddSchema.parse(body)

    const { partId, no } = validatedData

    // 验证分区存在
    const existingPart = await prisma.part.findUnique({
      where: { id: partId },
    })

    if (!existingPart) {
      return errorResponse('分区不存在', 404)
    }

    // 创建铺位
    const newPosition = await prisma.position.create({
      data: {
        position_no: no,
        partId,
        price_base: 0, // 默认价格基数
        photo: [],
        business_hours: [],
      },
    }) as Position

    return successResponse({ id: newPosition.id })
  } catch (error) {
    console.error('Error creating position:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
