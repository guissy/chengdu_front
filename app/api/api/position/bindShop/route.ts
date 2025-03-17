import { prisma } from '@/app/lib/prisma'
import { positionBindShopSchema } from '@/app/lib/schemas/position'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Position, Shop } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = positionBindShopSchema.parse(body)

    const { id, shopId } = validatedData

    // 验证铺位是否存在
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    }) as Position

    if (!existingPosition) {
      return errorResponse('铺位不存在', 404)
    }

    // 检查铺位是否已被占用
    if (existingPosition.shopId) {
      return errorResponse('铺位已被占用', 400)
    }

    // 验证商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id: shopId },
    }) as Shop

    if (!existingShop) {
      return errorResponse('商家不存在', 404)
    }

    // 绑定商家
    await prisma.position.update({
      where: { id },
      data: {
        shopId,
      },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error binding shop to position:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
