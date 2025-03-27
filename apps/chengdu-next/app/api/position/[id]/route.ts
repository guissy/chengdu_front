import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

// 获取铺位详情
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

    const position = await prisma.position.findUnique({
      where: { id: result.data.id },
      include: {
        shop: {
          select: {
            id: true,
            shop_no: true,
          },
        },
      },
    })

    if (!position) {
      return errorResponse('Position not found', 404)
    }

    // 转换数据格式
    const response = {
      ...position,
      shopId: position.shop?.id || null,
      shop_no: position.shop?.shop_no || null,
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching position:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
