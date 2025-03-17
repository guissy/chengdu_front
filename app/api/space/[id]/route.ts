import { prisma } from '@/app/lib/prisma'
import { spaceResponseSchema } from '@/app/lib/schemas/space'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Shop, Space } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id

    // 查询数据库，找出广告位详情
    const space = await prisma.space.findUnique({
      where: { id },
      include: {
        shop: true,
      }
    }) as Space & { shop: Shop }

    if (!space) {
      return errorResponse('广告位不存在', 404)
    }

    // 验证响应数据
    spaceResponseSchema.parse(space)

    return successResponse(space)
  } catch (error) {
    console.error('Error fetching space detail:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
