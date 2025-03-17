import { prisma } from '@/app/lib/prisma'
import { spaceListResponseSchema, spaceListSchema } from '@/app/lib/schemas/space'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Space } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = spaceListSchema.parse(body)

    const { shopId } = validatedData

    // 查询数据库，找出所有广告位
    const spaces = await prisma.space.findMany(shopId ? {
      where: { shopId },
      include: { shop: true },
    } : undefined) as Space[]

    const responseData = {
      list: spaces,
    }

    // 验证响应数据
    spaceListResponseSchema.parse(responseData)

    return successResponse(responseData)
  } catch (error) {
    console.error('Error fetching space list:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
