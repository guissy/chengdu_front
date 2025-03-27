import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PositionBindShopRequestSchema } from '@/lib/schema/position'

/**
 * @desc: 绑定铺位和商铺
 * @body: PositionBindShopRequest
 * @response: { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PositionBindShopRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id, shopId } = requestResult.data

    // 检查铺位是否存在
    const position = await prisma.position.findUnique({
      where: { id },
    })

    if (!position) {
      return errorResponse('Position not found', 404)
    }

    // 检查商家是否存在
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // 绑定商家
    await prisma.position.update({
      where: { id },
      data: { shopId },
    })

    return successResponse({
      message: 'Shop bound successfully',
    })
  } catch (error) {
    console.error('Error binding shop:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 