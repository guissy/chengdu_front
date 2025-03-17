import { prisma } from '@/app/lib/prisma'
import { positionListResponseSchema, positionListSchema } from '@/app/lib/schemas/position'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Position } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = positionListSchema.parse(body)

    const { partId } = validatedData

    // 查询数据库，找出所有铺位
    const positions = await prisma.position.findMany(partId ? {
      where: { partId },
      include: { shop: true },
    } : undefined) as (Position & { shop: { shop_no: string } })[]

    const formattedPositions = positions?.map((position) => ({
      ...position,
      positionId: position.id,
      shop_no: position.shop?.shop_no || null,
    })) || []

    const responseData = {
      list: formattedPositions,
    }
    // 验证响应数据
    positionListResponseSchema.parse(responseData)

    return successResponse(responseData)
  } catch (error) {
    console.error('Error fetching position list:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
