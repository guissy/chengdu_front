import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const RequestSchema = z.object({
  id: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { id } = result.data

    // 检查商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
      include: {
        position: true,
        spaces: true,
      },
    })

    if (!existingShop) {
      return errorResponse('Shop not found', 404)
    }

    // 检查是否有关联的铺位或广告位
    if (existingShop.position || existingShop.spaces.length > 0) {
      return errorResponse('Cannot delete shop with associated positions or spaces', 400)
    }

    // 删除商家
    await prisma.shop.delete({
      where: { id },
    })

    return successResponse({
      message: 'Shop deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting shop:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 