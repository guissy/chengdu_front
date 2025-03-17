import { prisma } from '@/app/lib/prisma'
import { positionSetEmptySchema } from '@/app/lib/schemas/position'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Position } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = positionSetEmptySchema.parse(body)

    const { id } = validatedData

    // 验证铺位是否存在
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    }) as Position

    if (!existingPosition) {
      return errorResponse('铺位不存在', 404)
    }

    // 检查铺位是否已经是空铺
    if (!existingPosition.shopId) {
      return errorResponse('铺位已经是空铺', 400)
    }

    // 置空铺位
    await prisma.position.update({
      where: { id },
      data: {
        shopId: null,
      },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error setting empty position:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
