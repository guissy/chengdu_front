import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ShopResponseSchema } from '@/lib/schema/shop'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

/**
 * @desc: 获取商铺详情
 * @params: { id: string }
 * @response: ShopResponse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证路径参数
    const result = paramsSchema.safeParse(await params)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const shop = await prisma.shop.findUnique({
      where: { id: result.data.id },
      include: {
        position: true,
        part: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // 转换数据格式
    const response = {
      ...shop,
      position: shop.position ? {
        id: shop.position.id,
        position_no: shop.position.position_no,
        photo: shop.position.photo,
      } : undefined,
      part: shop.part ? {
        id: shop.part.id,
        name: shop.part.name,
      } : undefined,
    }
    
    // 优化验证逻辑，避免重复调用safeParse
    const validateResult = ShopResponseSchema.safeParse(response)
    if (!validateResult.success) {
      return errorResponse('Invalid response data', 500, validateResult.error)
    }
    return successResponse(response)
  } catch (error) {
    console.error('Error fetching shop:', error)
    return errorResponse('Internal Server Error', 500)
  }
}

/**
 * @desc: 删除商铺
 * @params: { id: string }
 * @response: { message: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证路径参数
    const result = paramsSchema.safeParse(await params)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const shop = await prisma.shop.findUnique({
      where: { id: result.data.id },
      include: {
        position: true,
      },
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // 检查是否有关联的铺位
    if (shop.position) {
      return errorResponse('Cannot delete shop with associated position', 400)
    }

    // 删除商家
    await prisma.shop.delete({
      where: { id: result.data.id },
    })

    return successResponse({
      message: 'Shop deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting shop:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
