import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { ShopListRequestSchema, ShopListResponseSchema } from '@/lib/schema/shop'

/**
 * @desc: 获取商铺列表
 * @query: ShopListRequest
 * @response: ShopListResponse
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const body = {
      cbdId: searchParams.get('cbdId') || undefined,
      keyword: searchParams.get('keyword') || undefined
    }

    // 验证请求参数
    const requestResult = ShopListRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { cbdId, keyword } = requestResult.data

    // 构建查询条件
    const where = {
      ...(cbdId ? { cbdId } : {}),
      ...(keyword ? {
        OR: [
          { shop_no: { contains: keyword } },
          { name: { contains: keyword } },
          { contact_name: { contains: keyword } },
          { contact_phone: { contains: keyword } },
        ],
      } : {}),
    }

    // 查询商家列表
    const shops = await prisma.shop.findMany({
      where,
      include: {
        position: true,
        part: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        shop_no: 'asc',
      },
    })

    // 转换数据格式
    const list = shops.map(shop => ({
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
    }))

    const response = { list }

    // 验证响应数据
    const responseResult = ShopListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching shops:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
