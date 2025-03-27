import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { DashboardRecentShopsRequestSchema, DashboardRecentShopsResponseSchema } from '@/lib/schema/dashboard'

/**
 * @desc: 获取最近添加的商铺
 * @query: DashboardRecentShopsRequest
 * @response: DashboardRecentShopsResponse
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number(searchParams.get('limit')) || 5

    // 验证请求参数
    const requestResult = DashboardRecentShopsRequestSchema.safeParse({ limit })
    if (!requestResult.success) {
      return errorResponse('Invalid request parameters', 400, requestResult.error)
    }

    // 查询最近添加的商铺
    const shops = await prisma.shop.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        shop_no: true,
        type: true,
        createdAt: true,
        trademark: true,
      },
    })

    const data = shops.map(shop => ({
        ...shop,
    }))

    // 验证响应数据
    const responseResult = DashboardRecentShopsResponseSchema.safeParse(data)
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error getting recent shops:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 