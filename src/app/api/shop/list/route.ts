import { prisma } from '@/app/lib/prisma'
import { shopListResponseSchema } from '@/app/lib/schemas/shop'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'
import { Shop, Space } from '@prisma/client';

export async function GET() {
  try {
    // 查询数据库，找出所有商家
    const shops = await prisma.shop.findMany({
      include: {
        spaces: true,
      },
    }) as (Shop & { spaces: Space[] })[]

    // 处理返回数据
    const formattedShops = shops.map((shop) => ({
      ...shop,
      shopId: shop.id,
      total_space: shop.spaces?.length ?? 0,
      put_space: shop.spaces?.filter((space) => space.state === "ENABLED").length ?? 0,
      photo: shop.environment_photo.concat(shop.building_photo),
    }))

    const responseData = {
      list: formattedShops,
    }

    // 验证响应数据
    shopListResponseSchema.parse(responseData)

    return successResponse(responseData)
  } catch (error) {
    console.error('Error fetching shop list:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
