import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceAddRequestSchema } from '@/lib/schema/space'
import { SpaceType, SpaceState, SpaceSite, SpaceStability } from '@prisma/client'

/**
 * @desc: 添加新空间
 * @body: SpaceAddRequest
 * @response: { id: string, type: string, count: number, state: string, shop: { id: string, shop_no: string } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceAddRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const {
      shopId,
      type,
      setting,
      count,
      state,
      price_factor,
      tag,
      site,
      stability,
      photo,
      description,
      design_attention,
      construction_attention,
    } = requestResult.data

    // 检查商家是否存在
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // 创建广告位
    const space = await prisma.space.create({
      data: {
        shopId,
        type: type as SpaceType,
        setting,
        count: count || 1,
        state: state ? (state as SpaceState) : 'ENABLED',
        price_factor: price_factor || 1.0,
        tag,
        site: site as SpaceSite | null,
        stability: stability as SpaceStability | null,
        photo: photo || [],
        description,
        design_attention,
        construction_attention,
      },
      include: {
        shop: {
          select: {
            id: true,
            shop_no: true,
            // name: true,
          },
        },
      },
    })

    return successResponse({
      id: space.id,
      type: space.type,
      count: space.count,
      state: space.state,
      shop: {
        id: space.shop.id,
        shop_no: space.shop.shop_no,
        // name: space.shop.name,
      },
    })
  } catch (error) {
    console.error('Error creating space:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 