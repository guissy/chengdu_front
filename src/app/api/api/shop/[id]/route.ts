import { prisma } from '@/app/lib/prisma'
import { shopResponseSchema } from '@/app/lib/schemas/shop'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'
import { NextRequest } from 'next/server';
import { Position, Shop, Space } from '@prisma/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id

    // 查询数据库，找出商家详情
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        spaces: true,
        position: true,
      },
    }) as Shop & { spaces: Space[] } & { position: Position }

    if (!shop) {
      return errorResponse('商家不存在', 404)
    }

    // 处理返回数据
    const formattedShop = {
      ...shop,
      shopId: shop.id,
      total_space: shop.spaces?.length ?? 0,
      put_space: shop.spaces?.filter((space) => space.state === "ENABLED").length ?? 0,
      photo: shop.environment_photo.concat(shop.building_photo),
    }

    // 验证响应数据
    shopResponseSchema.parse(formattedShop)

    return successResponse(formattedShop)
  } catch (error) {
    console.error('Error fetching shop detail:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
