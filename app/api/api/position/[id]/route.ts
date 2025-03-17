import { prisma } from '@/app/lib/prisma'
import { positionResponseSchema } from '@/app/lib/schemas/position'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Position } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id
    // 查询数据库，找出铺位详情
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        part: {
          select: {
            id: true,
          },
        },
        shop: {
          select: {
            shop_no: true,
          },
        },
      },
    }) as Position & { shop: { shop_no: string } }

    if (!position) {
      return errorResponse('铺位不存在', 404)
    }

    const formattedPosition = {
      ...position,
      positionId: position.id,
      shop_no: position.shop?.shop_no || null,
    }

    // 验证响应数据
    positionResponseSchema.parse(formattedPosition)

    return successResponse(formattedPosition)
  } catch (error) {
    console.error('Error fetching position detail:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
