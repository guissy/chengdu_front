import { prisma } from '@/app/lib/prisma'
import { spaceAddSchema } from '@/app/lib/schemas/space'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Space, SpaceSite, SpaceStability, SpaceState, SpaceType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = spaceAddSchema.parse(body)

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
    } = validatedData

    // 验证商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id: shopId },
    })

    if (!existingShop) {
      return errorResponse('商家不存在', 404)
    }

    // 创建广告位
    const newSpace = await prisma.space.create({
      data: {
        shopId,
        type: type as unknown as SpaceType,
        setting,
        count: count || 1,
        state: state as unknown as SpaceState || SpaceState.ENABLED,
        price_factor: price_factor || 1.0,
        tag,
        site: site as unknown as SpaceSite,
        stability: stability as unknown as SpaceStability,
        photo: photo || [],
        description,
        design_attention,
        construction_attention,
      },
    }) as Space

    return successResponse({ id: newSpace.id })
  } catch (error) {
    console.error('Error creating space:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
